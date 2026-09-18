---
title: "Programmers. 중요한 단어를 스포방지"
date: 2026-09-18T12:56:04+09:00

categories:
  - Problem Solving
series:
tags:
psTags:
  - Hash Table
  - Sorting
  - String
features:
  - katex

draft: false
original: ""
---

## 문제

<https://school.programmers.co.kr/learn/courses/30/lessons/468370>

## 풀이

스트링 `message`와 2차 인티저 배열 `spoilerRanges`가 주어진다. 이 때, 중요한 단어의 수를 리턴하면 된다.

중요한 단어가 되는 조건은 다음과 같이 주어진다:

1. 스포 방지 단어여야 합니다.
2. 메시지의 스포 방지 구간이 아닌 구간(= 어떤 스포 방지 구간에도 속하지 않는 모든 구간: 각 구간의 앞·사이·뒤 포함)에 등장한 적이 없어야 합니다.
3. 이전에 공개된 스포 방지 단어와 중복되지 않아야 합니다.
4. 여러 단어가 동시에 공개된 경우, 왼쪽부터 순서대로 하나씩 중요한 단어인지 판단합니다.

먼저 메시지를 공백 기준으로 나누되, 각 단어의 시작, 끝 문자 인덱스도 함께 저장한다. 그리고 모든 문자 위치에 자신을 가리는 스포일러 구간의 번호를 기록한다.

단어에 스포일러 문자가 하나라도 있으면 스포일러 단어다. 

이 단어가 완전히 공개되는 시점은 단어가 걸친 구간 중 가장 뒤 번호의 구간을 클릭했을 때이므로, 그 번호를 `revealTime`으로 저장한다. 스포일러 구간에 한 번도 포함되지 않은 단어는 `normalWords` 집합에 넣어 둔다.

스포일러 단어를 `(revealTime, 시작 위치)` 순으로 정렬하면 실제 공개 순서와, 같은 구간에서의 왼쪽부터 판정하는 순서를 모두 만족한다. 

순서대로 보면서 일반 영역에 이미 등장한 단어와 앞서 공개된 스포일러 단어를 제외한 뒤 남은 단어만 센다. 문자와 단어를 한 번씩 처리하므로 시간 복잡도는 $O(|message| + r \log r)$이고, `r`은 스포일러 구간 수다.

## 코드

```swift
import Foundation

func solution(_ message: String, _ spoilerRanges: [[Int]]) -> Int {
    let chars = Array(message)
    var words: [(word: String, start: Int, end: Int)] = []
    var start = 0
    while start < chars.count {
        if chars[start] == " " {
            start += 1
            continue
        }
        var end = start
        while end + 1 < chars.count && chars[end + 1] != " " {
            end += 1
        }
        let word = String(chars[start...end])
        words.append((word, start, end))
        start = end + 1
    }
    var spoilerIndex = Array(repeating: -1, count: chars.count)
    for (index, range) in spoilerRanges.enumerated() {
        let left = range[0]
        let right = range[1]
        for i in left...right {
            spoilerIndex[i] = index
        }
    }
    var normalWords = Set<String>()
    var spoilerWords: [(word: String, revealTime: Int, start: Int)] = []
    for item in words {
        var isSpoilerWord = false
        var revealTime = -1
        var hasNormalCharacter = false
        for i in item.start...item.end {
            if spoilerIndex[i] == -1 {
                hasNormalCharacter = true
            } else {
                isSpoilerWord = true
                revealTime = max(revealTime, spoilerIndex[i])
            }
        }
        if isSpoilerWord {
            spoilerWords.append(
                (word: item.word, revealTime: revealTime, start: item.start)
            )
        } else if hasNormalCharacter {
            normalWords.insert(item.word)
        }
    }
    spoilerWords.sort {
        if $0.revealTime != $1.revealTime {
            return $0.revealTime < $1.revealTime
        }
        return $0.start < $1.start
    }
    var revealedWords = Set<String>()
    var answer = 0
    for item in spoilerWords {
        if !normalWords.contains(item.word)
            && !revealedWords.contains(item.word) {
            answer += 1
        }
        revealedWords.insert(item.word)
    }
    return answer
}
```
