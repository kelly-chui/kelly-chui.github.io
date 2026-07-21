---
title: "DevOps. 로컬 LLM IDE에 연동하기"
date: 2026-07-21T11:08:32+09:00

categories:
  - DevOps
series:
  - AI AGENTS
tags:
  - LLM
  - Local AI
  - Ollama

draft: true
original: ""
---

로컬 LLM 모델을 Xcode와 VSCode에 연동해보자.

## OpenCode 설치

```zsh
brew install sst/tap/opencode
```

### OpenCode 실행

```
cd ~/Projects/MyApp
opencode
```


<https://www.reddit.com/r/opencodeCLI/comments/1skym39/opencode_with_gemma4_on_ollama/?solution=7a19614a3f3753997a19614a3f375399&js_challenge=1&token=7afd7253fec22262ff1c52b1703fe9ec2075a4502b7b01c17a2fe869e950d28e&jsc_orig_r=>

```
import SwiftUI

struct ContentView: View {
    var body: some View {
        List {
            ForEach(topMountains, id: \$0.name) { mountain in
                VStack(alignment: .leading) {
                    Text(mountain.name)
                        .font(.headline)
                    Text("\(mountain.elevation) meters")
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
    }
}

struct Mountain {
    let name: String
    let elevation: Int
}

let topMountains = [
    Mountain(name: "Mount Everest", elevation: 8848),
    Mountain(name: "K2", elevation: 8611),
    Mountain(name: "Kangchenjunga", elevation: 8586),
    Mountain(name: "Lhotse", elevation: 8516),
    Mountain(name: "Makalu", elevation: 8485),
    Mountain(name: "Cho Oyu", elevation: 8188),
    Mountain(name: "Dhaulagiri", elevation: 8167),
    Mountain(name: "Annapurna I", elevation: 8091),
    Mountain(name: "Nanga Parbat", elevation: 8126),
    Mountain(name: "Gasherbrum I", elevation: 8035)
]

#Preview {
    ContentView()
}
```