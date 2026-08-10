---
title: "connect() | Node.js"
slug: /node/node/Client-connect
sidebar_label: "connect()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此方法使用可选指定的 SDK 版本连接到 Zilliz Cloud 集群。 | Node.js"
type: docx
token: SkLsdMpB7oiZLMx8T04cCd9Knqf
sidebar_position: 4
keywords: 
  - 问答系统
  - llm-as-a-judge
  - 混合向量搜索
  - 视频去重
  - zilliz
  - zilliz cloud
  - cloud
  - connect()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# connect()

此方法使用可选指定的 SDK 版本连接到 Zilliz Cloud 集群。

```javascript
connect(sdkVersion): void
```

## 请求语法\{#request-syntax}

```javascript
connect({
    sdkVersion: string
})
```

**参数：**

- **sdkVersion** (*string*) -

    **【必填】**

    您的 Node.js SDK 版本。

**返回** *void*

此方法不返回任何内容。

## 示例\{#example}

```java
connect(2.3.5)
```

