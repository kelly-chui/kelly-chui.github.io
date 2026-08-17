---
title: "미방문록. PoC 대표 색상 추출 Picker 만들기"
date: 2026-02-09T17:36:10+09:00

categories:
  - Project
series:
  - Punchin
tags:
  - Image Processing

draft: false
original: ""
---

{{< image src="image-001-optimized-image.webp" >}}

음식 사진에서 색상을 뽑아서 카드의 배경색에 적용하는 기능을 구현해야 했다.

## 처음 생각한 방향

- 원본 이미지를 그대로 다루면 비용이 크다.
- 색이 너무 많으면 후보가 지저분해진다.
- 원하는 색이 반드시 많이 나오는 색은 아니다.
- 결과를 화면에 어떻게 보여줄지도 같이 고민해야 한다.

## 직접 구현해보자.

외부 라이브러리를 쓰기보다는, 가능한 경우에는 항상 먼저 구현해보고 그 이후에 외부 라이브러리를 쓰는 방향을 선호하기 때문에, 직접 구현해보기로 했다.

학부 시절에 이미지 프로세싱을 하기도 했고 나름대로 흥미롭게 접근했다.

### CoreGraphics에서 픽셀 읽기

색상을 추출하려면 결국 이미지의 픽셀 값에 접근해야 했다.

처음에는 Python 처럼 `CGImage`의 `(x, y)` 위치의 RGB 값을 바로 가져올 수 있을 거라고 생각했다.

그런데 실제로는 그렇게 단순하지 않았다. 이미지마다 픽셀 포맷이나 알파 채널의 위치가 다를 수 있고, 메모리도 2차원 픽셀 배열처럼 주어지는 것이 아니었다.

그래서 원본 `CGImage`의 메모리를 직접 해석하기보다는, 내가 원하는 형식의 픽셀 버퍼를 하나 만들고 그 위에 이미지를 다시 그리는 방식을 사용했다.

```swift
let pixelWidth = cgImage.width
let pixelHeight = cgImage.height
let bytesPerRow = pixelWidth * 4

var pixelBuffer = [UInt8](
    repeating: 0,
    count: pixelHeight * bytesPerRow
)

let alphaLayout = CGImageAlphaInfo.premultipliedLast
let bitmapLayout = CGBitmapInfo.byteOrder32Big.union(
    CGBitmapInfo(rawValue: alphaLayout.rawValue)
)

let didDraw = pixelBuffer.withUnsafeMutableBytes { rawBuffer -> Bool in
    guard let context = CGContext(
        data: rawBuffer.baseAddress,
        width: pixelWidth,
        height: pixelHeight,
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: bitmapLayout.rawValue
    ) else {
        return false
    }
    context.draw(
        cgImage,
        in: CGRect(x: 0, y: 0, width: pixelWidth, height: pixelHeight)
    )
    return true
}
```

여기서는 RGB 각 채널과 알파 채널에 8비트씩 사용한다. 픽셀 하나에 R, G, B, A 네 채널이 있으니 총 32비트, 즉 4바이트가 필요하다.

따라서 이미지의 너비가 `width`라면 한 행에 필요한 메모리는 `width * 4`가 된다.

```swift
let bytesPerRow = width * 4
```

전체 픽셀 데이터는 `(x, y)`로 바로 접근할 수 있는 2차원 배열이 아니라, 하나의 연속된 바이트 버퍼에 들어간다.

```text
row 0: [R, G, B, A, R, G, B, A, ...]
row 1: [R, G, B, A, R, G, B, A, ...]
row 2: [R, G, B, A, R, G, B, A, ...]
```

그래서 `(x, y)`에 있는 픽셀을 찾으려면 `y`번째 행까지 이동한 다음, 그 안에서 `x`번째 픽셀의 위치를 계산해야 한다.

```swift
let offset = y * bytesPerRow + x * 4
```

이 위치부터 4바이트를 읽으면 지정한 픽셀 포맷에 따라 R, G, B, A 값을 얻을 수 있다.

처음에는 `CGImageAlphaInfo`나 `CGBitmapInfo` 같은 타입이 왜 필요한지 잘 와닿지 않았다. 그런데 픽셀 데이터를 `UInt8` 배열로 놓고 보니 이유가 좀 보였다.

바이트 배열 자체만 봐서는 각각의 바이트가 R인지 G인지, 알파 채널은 어디에 있는지 알 수 없다. 결국 이 바이트들을 어떤 픽셀 포맷으로 해석할지에 대한 정보가 따로 필요하다.

그래서 `CGContext`를 만들 때 원하는 픽셀 포맷을 지정하고, 원본 이미지를 그 컨텍스트에 그려서 내가 다루기 쉬운 형태의 픽셀 버퍼로 만들어 사용했다.

Python에서 이미지 라이브러리를 사용할 때는 보통 `image[y][x]`처럼 접근했기 때문에 이런 부분을 거의 생각하지 않았는데, CoreGraphics로 직접 픽셀 버퍼를 다뤄보니, 그동안 Python 이미지 라이브러리가 얼마나 추상화 되어있는지 알게 되었다...

## 동작 원리

대표색을 뽑는 과정은 크게 픽셀 양자화 → 히스토그램 집계 → 후보 추출 → 클러스터링 순서로 구현했다.

### 픽셀 양자화

이미지 크기를 줄인 뒤에는 각 픽셀을 하나씩 보면서 RGB 값을 일정한 비트 수로 줄인다.

RGB 각 채널은 8비트이므로 `0...255`, 총 256개의 값을 가질 수 있다. 예를 들어 `quantBits = 4`라면 각 채널의 상위 4비트만 남겨 256개의 값을 16단계로 줄인다.

24비트 RGB는 이론적으로 약 1,677만 개의 색을 표현할 수 있다. 이걸 그대로 히스토그램으로 만들면 눈으로 보기에는 거의 같은 색도 서로 다른 색으로 집계된다.

사진에는 조명이나 그림자, 노이즈 때문에 이런 미세한 색 차이가 많이 생기기 때문에, 비슷한 색을 어느 정도 같은 색으로 취급할 필요가 있었다.

```swift
let quantBits = config.quantBits
let shift = 8 - quantBits
let mask: UInt32 = (1 << UInt32(quantBits)) - 1

let rq = UInt32(r >> shift)
let gq = UInt32(g >> shift)
let bq = UInt32(b >> shift)

let key = (rq << UInt32(2 * quantBits))
    | (gq << UInt32(quantBits))
    | bq

counts[key, default: 0] += 1
```

`quantBits = 4`라면 가능한 색의 수는 최대 `16 × 16 × 16 = 4,096`개까지 줄어든다.

### 히스토그램

양자화한 R, G, B 값은 하나의 `UInt32`에 패킹해서 키로 사용하고, 이미지 전체에서 같은 키가 몇 번 등장했는지 센다.

```swift
var counts: [UInt32: Int] = [:]
counts.reserveCapacity(2048)
```

이렇게 하면 각 색이 이미지에서 얼마나 큰 비중을 차지하고 있는지 알 수 있다. 많이 등장한 색일수록 대표색이 될 가능성이 높은 셈이다.

### 후보 추출

히스토그램에 있는 모든 색을 이후 과정에서 비교할 필요는 없었다.

등장 횟수를 기준으로 정렬한 다음, 최종적으로 필요한 팔레트보다 조금 넉넉하게 상위 색만 후보로 가져왔다.

```swift id="1f9suv"
let candidateLimit = max(
    config.paletteCount * config.candidateMultiplier,
    config.candidateMinimum
)

let sortedKeys = counts
    .sorted { $0.value > $1.value }
    .prefix(candidateLimit)
```

패킹해두었던 키도 다시 R, G, B로 풀어낸다.

```swift id="96alwc"
for (key, weight) in sortedKeys {
    let bq = key & mask
    let gq = (key >> UInt32(quantBits)) & mask
    let rq = (key >> UInt32(2 * quantBits)) & mask

    let r = UInt8(
        min(255, Int(rq << UInt32(shift)) + Int(1 << (shift - 1)))
    )
    let g = UInt8(
        min(255, Int(gq << UInt32(shift)) + Int(1 << (shift - 1)))
    )
    let b = UInt8(
        min(255, Int(bq << UInt32(shift)) + Int(1 << (shift - 1)))
    )

    candidates.append(
        (PaletteColor(r: r, g: g, b: b), weight)
    )
}
```

양자화하면서 하위 비트를 버렸기 때문에 원래 색을 그대로 복원할 수는 없다. 대신 각 양자화 구간의 중간값을 그 구간의 대표 색으로 사용했다.

### 클러스터링과 머지

양자화를 거쳤다고 해도 서로 비슷한 색이 여러 후보로 남을 수 있다. 예를 들어 음식 사진에서 갈색이 많이 사용됐다면 밝기가 조금씩 다른 갈색이 팔레트 대부분을 차지할 수도 있다.

그래서 후보 색 사이의 거리를 비교해서 가까운 색끼리 클러스터로 묶었다. 

먼저 양자화 단계의 간격을 기준으로 어느 정도까지 비슷한 색으로 볼 것인지 결정한다.

```swift
let bucket = max(1, 1 << shift)
let threshold = max(
    config.clusterThresholdBase,
    bucket * config.clusterThresholdBucketFactor
)
let thresholdSq = threshold * threshold
```

클러스터에는 단순히 색 하나만 저장하지 않고, 지금까지 합쳐진 색의 RGB 합과 등장 횟수를 함께 저장했다.

```swift
struct Cluster {
    var sumR: Int
    var sumG: Int
    var sumB: Int
    var weight: Int

    var color: PaletteColor {
        let w = max(1, weight)
        let r = UInt8(min(255, max(0, sumR / w)))
        let g = UInt8(min(255, max(0, sumG / w)))
        let b = UInt8(min(255, max(0, sumB / w)))

        return PaletteColor(r: r, g: g, b: b)
    }
}
```

후보 색이 기존 클러스터와 충분히 가깝다면 해당 클러스터에 합치고, 그렇지 않으면 새로운 클러스터를 만든다.

```swift
var clusters: [Cluster] = []
clusters.reserveCapacity(config.paletteCount * 2)

for (c, w) in candidates {
    if let idx = clusters.firstIndex(where: {
        weightedColorDistanceSq($0.color, c, config: config) <= thresholdSq
    }) {
        clusters[idx].sumR += Int(c.r) * w
        clusters[idx].sumG += Int(c.g) * w
        clusters[idx].sumB += Int(c.b) * w
        clusters[idx].weight += w
    } else {
        clusters.append(Cluster(
            sumR: Int(c.r) * w,
            sumG: Int(c.g) * w,
            sumB: Int(c.b) * w,
            weight: w
        ))
    }
}
```

여기서 단순히 가까운 색 하나를 버리는 대신 각 색의 등장 횟수를 가중치로 사용해서 평균을 냈다. 예를 들어, 비슷한 두 색 중 하나가 이미지에서 훨씬 많이 등장했다면, 합쳐진 클러스터의 색도 자연스럽게 그쪽에 더 가까워진다.

### 설정값 조절하기

{{< image src="image-002-optimized-image.webp" align="center" >}}

앞선 과정에서 다운스케일링 크기, 양자화 비트, 팔레트 개수, 후보 개수, 클러스터링 정책과 같은 경우에는 결과값에 영향을 끼친다.

최적의 결과값을 찾으려면 이 값들을 조정하면서 찾아야 하는데, 코드에서 수치를 바꿔가면서 하는 것은 너무 비효율적이기 때문에 UI에서 config을 직접 조절할 수 있도록 했다.

연산의 강도에 따라서 빠름/기본/품질의 프리셋도 만들었다.

## 정리

대표 색 추출은 이미지 축소, 양자화, 히스토그램 집계, 후보 추출, 클러스터링 순서로 구현했다.

원본 이미지의 모든 색을 그대로 비교하지 않고, 먼저 이미지 크기를 줄인 뒤 RGB를 양자화해서 비슷한 색을 같은 구간으로 묶었다. 

이후 등장 빈도가 높은 색만 후보로 남기고, 가까운 색을 다시 클러스터링해서 최종 팔레트를 만든다.

```text
Image
  ↓
Downscale
  ↓
Quantization
  ↓
Histogram
  ↓
Candidates
  ↓
Clustering
  ↓
Palette
```

결과에 영향을 주는 값도 꽤 많았다. 다운스케일링 크기, 양자화 비트 수, 후보 개수와 클러스터링 기준을 Config로 분리하고, Picker에서 직접 값을 바꾸면서 결과를 비교할 수 있도록 했다.

실제 앱에서는 이미지를 넣는 경로가 한 곳으로 모여 있기 때문에 대표 색도 이미지가 들어오는 시점에 한 번만 계산하면 된다. UI에서는 계산이 끝난 팔레트를 받아 카드 배경 등에 사용한다.

직접 구현하면서 CoreGraphics의 픽셀 버퍼부터 색 양자화와 클러스터링까지 다루게 됐다. 

특히 Python의 이미지 라이브러리에서는 당연하게 사용했던 픽셀 접근이 실제로는 픽셀 포맷과 메모리 레이아웃 위에 만들어진 추상화라는 점을 알기도 했고, 참 그리웠다...
