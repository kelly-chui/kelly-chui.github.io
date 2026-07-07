---
title: "The Swift Programming Language. Type Casting"
date: 2023-06-27
categories: ["Swift"]
series: ["The Swift Programming Language"]
tags: ["The Swift Programming Language", "Swift", "Type Casting"]
weight: 34

draft: false
original: "https://junmusu.tistory.com/107"
---

{{< theme-image light="/images/assets/swift-logo-light.svg" dark="/images/assets/swift-logo-dark.svg" alt="Swift logo" >}}

## Type Casting

타입 캐스팅(Type casting)은 인스턴스의 타입을 체크하거나, 해당 클래스가 소속된 계층의 다른 슈퍼클래스나 서브클래스로 취급하는 방법이다.

스위프트의 타입 캐스팅은 is 혹은 as 연산자로 구현된다. 이 두 연산자는 값의 타입을 체크하거나, 다른 타입으로 값을 캐스트하는 간단하고 표현적인 방법을 제공한다.

타입이 프로토콜을 준수하고 있는지 여부를 확인하기 위해 타입 캐스팅을 사용할 수도 있다. 

### Defining a Class Hierarchy for Type Casting

클래스와 서브클래스들의 계층에서 특정 클래스의 타입을 체크하거나 그 클래스의 인스턴스를 같은 계층의 다른 클래스로 캐스트할 때 사용할 수 있다. 아래의 코드 세 개는 앞으로 나올 예시들에서 쓰일 클래스의 계층과, 이 클래스들의 인스턴스를 담고 있는 배열을 정의한다. 

첫 번째 코드는 베이스 클래스 MediaItem을 정의한다. 이 클래스는 디지털 미디어 라이브러리에서 나오는 모든 종류의 아이템에 대한 기본적인 기능을 제공한다. String 타입 프로퍼티 name과 init(name:) 이니셜라이저를 선언한다.(이 클래스에서는 영화와 노래 같은 모든 미디어 아이템은 모두 이름이 있다고 가정한다.)


```bash
class MediaItem {
    var name: String
    init(name: String) {
        self.name = name
    }
}
```
 

다음 코드는 MediaItem의 서브클래스 두 개를 정의한다. 첫 번째 서브클래스 Movie는 영화에 대한 추가적인 정보를 캡슐화한다. 이 서브클래스는 MediaItem 클래스를 베이스로 위에 director 프로퍼티와 이에 상응하는 이니셜라이저를 추가한다. 두 번째 서브클래스 Song은 artist 프로퍼티와 이니셜라이저를 추가한다.


```swift
class Movie: MediaItem {
    var director: String
    init(name: String, director: String) {
        self.director = director
        super.init(name: name)
    }
}

class Song: MediaItem {
    var artist: String
    init(name: String, artist: String) {
        self.artist = artist
        super.init(name: name)
    }
}
```
 

마지막 코드는 두 개의 Movie 인스턴스와 세 개의 Song 인스턴스를 포함하는 상수 배열 library를 만든다. library의 타입은 배열 리터럴의 원소들로 추론된다. 스위프트의 타입 체커는 Movie와 Song이 동일한 슈퍼클래스 MediaItem을 가지고 있다는 것을 추론할 수 있으므로, library의 타입은 [MediaItem]으로 추론된다:


```swift
let library = [
    Movie(name: "Casablanca", director: "Michael Curtiz"),
    Song(name: "Blue Suede Shoes", artist: "Elvis Presley"),
    Movie(name: "Citizen Kane", director: "Orson Welles"),
    Song(name: "The One And Only", artist: "Chesney Hawkes"),
    Song(name: "Never Gonna Give You Up", artist: "Rick Astley")
]
// the type of "library" is inferred to be [MediaItem]
```
 

library에 저장된 아이템은 여전히 Movie와 Song의 인스턴스이다. 하지만 이 배열의 원소들을 반복(iterate)하면 Movie나 Song이 아닌 MediaItem 타입의 아이템을 받게 된다. 이러한 아이템들의 기존 타입으로 작업을 하려면 아래에 설명된 대로 타입 체크를 하거나, 다른 타입으로 _다운캐스트(downcast)_ 를 해야한다(주: 여기서 다른 타입이란 현재 아이템의 타입인 MediaItem 기준으로 다른 타입을 뜻함 -> 원소들의 기존 타입은 Movie나 Song 타입이기 때문에 이 타입으로 다운캐스트를 해야한다는 의미, 슈퍼클래스와 서브클래스도 기본적으로 서로 다른 타입이다.)

### Checking Type

타입 체크 연산자 (is)를 사용하여 인스턴스가 특정 서브클래스 타입인지 체크할 수 있다. 타입 체크 연산자는 인스턴스가 그 서브클래스 타입이면 true를 리턴하고, 아니라면 false를 리턴한다.

아래의 예시는 library 안에 있는 Movie와 Song 인스턴스의 개수를 세는 두 개의 변수 movieCount와 songCount를 정의한다.


```swift
var movieCount = 0
var songCount = 0

for item in library {
    if item is Movie {
        movieCount += 1
    } else if item is Song {
        songCount += 1
    }
}

print("Media library contains \(movieCount) movies and \(songCount) songs")
// Prints "Media library contains 2 movies and 3 songs"
```
 

이 예시는 library 안에 있는 모든 아이템을 순회한다. 이 for-in 루프에서 item 상수는 library 내부의 MediaItem이다.

item is Movie 는 현재 MediaItem이 Movie의 인스턴스라면 true를 리턴하고, 아니라면 false를 리턴한다. 비슷하게 item is Song은 아이템이 Song의 인스턴스인지 확인한다. for-in 루프가 끝나면, movieCount와 songCount의 값은 library 내부의 MediaItem 인스턴스들이 각 타입으로 발견된 수가 된다.

### Downcasting

특정 클래스 타입의 상수나 변수는 서브클래스의 인스턴스를 참조할 수 있다. 이게 필요한 경우에, 타입 캐스트 연산자 (as? 혹은 as!)를 사용하여 _다운캐스트(downcast)_ 를 시도할 수 있다.

다운캐스팅은 실패할 수 있기 때문에, 타입 캐스트 연산자는 두개의 다른 형태가 있다. 조건부 형태인 as?는 다운캐스팅 시도한 타입의 옵셔널 값을 리턴한다(주: 슈퍼클래스 -> 서브클래스로 as?를 이용해 다운캐스팅 하면 서브클래스 타입의 옵셔널 값이 리턴된다) . 강제적 형태인 as!는 다운캐스트를 시도하고 결과를 강제적으로 언래핑한다.

조건부 형태의 타입 캐스트 연산자 (as?)는 다운캐스트가 성공할 것이라고 확신하지 못할 때 사용한다. 이 연산자는 항상 다운캐스트가 불가능 할 때는 nil이 되는 옵셔널 값을 리턴한다. 따라서 다운캐스트가 성공적으로 이루어졌는지 확인할 수 있다.

강제적 형태의 타입 캐스트 연산자 (as!)는 다운캐스트가 성공할 것이라는 확신이 있을 때 사용한다. 이 연산자는 잘못된 클래스 타입으로 다운캐스트를 시도했을 때, 런타임 에러를 발생시킨다.

아래의 예시는 library의 각 MediaItem들을 순회하고 각 아이템들의 적합한 설명을 출력한다. 이렇게 하려면, MediaItem이 아니라 Movie 혹은 Song으로 각 아이템에 접근해야 한다. 

이 예시에서 library 내부의 각 아이템은 Movie일 수도 있고, Song일 수도 있다. 각 아이템의 실제 클래스가 무엇인지 모르기 때문에, 다운캐스트를 확인하기 위해 조건부 형태의 연산자 (as?)를 사용하는 것이 적합하다.


```swift
for item in library {
    if let movie = item as? Movie {
        print("Movie: \(movie.name), dir. \(movie.director)")
    } else if let song = item as? Song {
        print("Song: \(song.name), by \(song.artist)")
    }
}

// Movie: Casablanca, dir. Michael Curtiz
// Song: Blue Suede Shoes, by Elvis Presley
// Movie: Citizen Kane, dir. Orson Welles
// Song: The One And Only, by Chesney Hawkes
// Song: Never Gonna Give You Up, by Rick Astley
```
 

이 예시는 현재 item을 Movie로 다운캐스트를 시도하는 것으로 시작한다. item이 MediaItem 인스턴스이기 때문에, Movie일 가능성도 있고, Song일 가능성도 있으며 그냥 MediaItem일 수도 있다. 이러한 불확정성 때문에 as? 형태의 타입 캐스트 오퍼레이터는 서브 클래스 타입으로 다운캐스트를 시도할 때 옵셔널 값을 리턴한다. item as? Movie의 결과의 타입은 Movie?(혹은 optional Movie)이다.

Song 인스턴스를 Movie로 다운캐스팅을 하면 실패한다. 이러한 상황을 처리하기 위해, 위의 예시는 옵셔널 바인딩을 이용하여 다운캐스팅의 결과가 실제 값을 가지고 있는지 확인한다. if let movie = item as? movie로 적힌 옵셔널 바인딩은 다음과 같이 읽을 수 있다:

> "item을 Movie로 접근을 시도해보고, 성공한다면 새로운 임시 상수 movie의 값을 리턴된 optional Movie에 들어있는 값으로 설정한다."

다운캐스팅이 성공한다면, director를 포함한 Movie의 프로퍼티들은 Movie 인스턴스를 설명을 출력하는데에 사용된다. 비슷한 원리가 Song 인스턴스를 확인할 때도 적용되고, artist 프로퍼티를 사용하여 Song의 설명을 출력한다.

> **Note**  
>  캐스팅은 실제로 인스턴스를 수정하거나 그 값을 변화시키지 않는다. 기본 인스턴스는 동일하게 유지되지만, 캐스트된 타입으로 처리되고 접근된다.

### Type Casting for Any and AnyObject

스위프트는 비특정 타입들로 작업하기 위해 두 개의 특별한 타입을 제공한다.

  - Any는 함수 타입을 포함하여, 모든 타입의 인스턴스를 나타낼 수 있다.
  - AnyObject는 모든 클래스 타입의 인스턴스를 나타낼 수 있다.



Any와 AnyObject는 이의 동작과 기능이 필요할 때만 명시적으로 사용해야 한다. 항상 코드에서 작업할 것으로 예측되는 특정한 타입을 지정하는 것이 더 낫다.

다음은 Any를 이용하여 함수와 클래스가 아닌 타입들도 포함된 여러 다른 타입들이 섞인 작업을 하는 예시이다. 이 예시는 [Any] 타입 배열 things를 생성한다.


```swift
var things: [Any] = []

things.append(0)
things.append(0.0)
things.append(42)
things.append(3.14159)
things.append("hello")
things.append((3.0, 5.0))
things.append(Movie(name: "Ghostbusters", director: "Ivan Reitman"))
things.append({ (name: String) -> String in "Hello, \(name)" })
```
 

things 배열은 두 개의 Int 값, 두 개의 Double 값, 하나의 String 값, 하나의 (Double, Double) 타입 튜플 값, 영화 "고스트버스터즈", (String) -> String 타입 클로저 표현식을 포함한다.

타입에 대해 Any나 AnyObject로만 알고 있는 특정 상수나 변수의 타입을 알아내기 위해, is 혹은 as 패턴을 switch 문의 케이스에 쓸 수 있다. 아래의 예시는 things를 전체 순회하고, switch 문을 사용하여 각 item의 타입을 쿼리한다. switch 문의 케이스들은 일치하는 값을 지정된 타입의 상수에 바인딩하여, 그 값이 출력 가능하도록 한다.


```swift
for thing in things {
    switch thing {
    case 0 as Int:
        print("zero as an Int")
    case 0 as Double:
        print("zero as a Double")
    case let someInt as Int:
        print("an integer value of \(someInt)")
    case let someDouble as Double where someDouble > 0:
        print("a positive double value of \(someDouble)")
    case is Double:
        print("some other double value that I don't want to print")
    case let someString as String:
        print("a string value of \"\(someString)\"")
    case let (x, y) as (Double, Double):
        print("an (x, y) point at \(x), \(y)")
    case let movie as Movie:
        print("a movie called \(movie.name), dir. \(movie.director)")
    case let stringConverter as (String) -> String:
        print(stringConverter("Michael"))
    default:
        print("something else")
    }
}

// zero as an Int
// zero as a Double
// an integer value of 42
// a positive double value of 3.14159
// a string value of "hello"
// an (x, y) point at 3.0, 5.0
// a movie called Ghostbusters, dir. Ivan Reitman
// Hello, Michael
```
 

> **Note**  
>  Any타입은 옵셔널 값을 포함하여 모든 타입의 값을 나타낸다. 스위프트는 값의 타입이 Any가 예상되는 옵셔널 값을 사용할 때 경고를 준다. 만약 옵셔널 값을 Any 값으로 사용해야 한다면, 아래와 같이 as 연산자를 사용하여 명시적으로 옵셔널을 Any로 캐스트할 수 있다.  
>  
```swift
let optionalNumber: Int? = 3
things.append(optionalNumber)        // Warning
things.append(optionalNumber as Any) // No warning​
```
 

원문: [https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)

[ ‎The Swift Programming Language (Swift 5.7) ‎Computing & Internet · 2014 books.apple.com ](<https://books.apple.com/kr/book/the-swift-programming-language-swift-5-7/id881256329?l=en>)
