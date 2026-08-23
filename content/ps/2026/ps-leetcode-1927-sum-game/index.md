---
title: "LeetCode 1927. Sum Game"
date: 2026-08-23T13:01:21+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Math
  - Greedy
features:
  - katex

draft: false
original: ""
---

## 문제

<https://leetcode.com/problems/sum-game>

## 풀이

정수와 `"?"`로 구성된 스트링 `num`이 주어진다. 

Alice와 Bob이 번갈아가며 스트링의 `"?"`를 0에서 9까지의 숫자로 채우는데, `num`의 중심을 기준으로 왼쪽 부분과 오른쪽 부분의 원소의 합이 같으면 Bob이 이기고 다르면 Alice가 이긴다. 

둘 다 최적으로 플레이할 때 Alice가 이기면 `true`, 지면 `false`를 리턴하면 된다.

마지막에 어떤 사람이 `"?"`를 조작하느냐가 승패를 가른다. 만약 마지막에 Alice가 조작할 수 있다면, 무조건 Alice가 이긴다. 그냥 같게 되지 않은 숫자로 바꾸면 되니까.

따라서 첫 턴에 Alice가 시작하므로, `"?"`의 개수가 홀수면 무조건 Alice가 이기게 된다.

이제 문제는 `"?"` 개수가 짝수일 때인데, 각 사람이 최적으로 플레이 한다고 했으므로, Alice는 Bob이 보정하기 어려워하는 극단값만 넣는다.

스트링을 반으로 나누고, Bob은 각 원소의 합을 같게 만들어야 하므로, 결국 Alice가 왼쪽에 9를 넣는다면 Bob은 오른쪽에 9를, Alice가 오른쪽에 9를 넣는다면 Bob은 왼쪽에 9를 넣게 된다.

이렇게 왼쪽, 오른쪽에 있는 `"?"` 하나씩은 쌍을 이뤄 상쇄되므로, 관심을 가져야 할 것은 왼쪽에 있는 `"?"`와 오른쪽에 있는 `"?"`의 개수 차이다.

`"?"`의 개수가 짝수이므로(앞서 말했듯이 홀수면 판정할 필요도 없이 Alice가 이긴다.) 서로 완벽하게 상쇄되고 남은 `"?"`는 한쪽에만 몰리게 된다.

즉, 왼쪽 `"?"` 개수를 $l$, 오른쪽 `"?"` 개수를 $r$이라 하면, $\frac{l+r}{2}$쌍 중 $\min(l, r)$쌍은 서로 미러링되어 합의 차이에 영향을 주지 않는다. 

남은 $\frac{|l-r|}{2}$쌍은 한쪽에만 존재하므로, Alice는 9를, Bob은 0을 넣어 쌍당 9만큼 차이가 생긴다.

따라서 `"?"`로 인해 변화하는 합의 차이는 다음과 같다.

$$\frac{9(l - r)}{2}$$

Bob이 이기려면 이 변화량이 초기 합의 차이 $\text{diff} = \text{leftSum} - \text{rightSum}$를 정확히 상쇄해야 한다.

$$\text{diff} + \frac{9(l-r)}{2} = 0$$

양변에 2를 곱하면:

$$2 \cdot \text{diff} + 9(l - r) = 0$$

이 식이 성립하면 Bob이 이기고, 아니면 Alice가 이긴다.

## 코드

```swift
class Solution {
    func sumGame(_ num: String) -> Bool {
        let mid = num.count / 2
        let left = Array(num.prefix(mid))
        let right = Array(num.suffix(mid))
        let leftQmarkCount = left.filter { $0 == "?" }.count
        let rightQmarkCount = right.filter { $0 == "?" }.count
        if (leftQmarkCount + rightQmarkCount) % 2 == 1 {
            return true
        }
        let leftSum = left.compactMap { Int(String($0)) }.reduce(0) { $0 + $1 }
        let rightSum = right.compactMap { Int(String($0)) }.reduce(0) { $0 + $1 }
        let diff = leftSum - rightSum
        let balance = 2 * diff + 9 * (leftQmarkCount - rightQmarkCount)
        return balance != 0
    }
}
```
