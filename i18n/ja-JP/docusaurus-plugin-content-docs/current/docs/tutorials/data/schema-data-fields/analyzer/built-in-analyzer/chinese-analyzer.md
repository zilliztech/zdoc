---
title: "中国語の | Cloud"
slug: /chinese-analyzer
sidebar_label: "中国語の"
beta: PUBLIC
notebook: FALSE
description: "中国語アナライザは、`中国` 語のテキストを処理するために特別に設計されており、効果的なセグメンテーションとトークン化を提供します。 | Cloud"
type: origin
token: Q7Xaw6Khxi6jxnkJSqqcYuYWnPd
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - analyzer
  - built-in analyzer
  - chinese analyzer
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 中国語の

中国語アナライザは、`中国` 語のテキストを処理するために特別に設計されており、効果的なセグメンテーションとトークン化を提供します。

### の定義{#}

中国の`分析装置`はから成っています:

- **トークナイザー**: jiebaトーク`ナイザーを`使用して、語彙と文脈に基づいて中国語のテキストをトークンに分割します。詳細については、Jiebaを参照してください。

- **フィルター**: cnalphanumonlyフィルターを使用して、中国語以外の文字を含むトークンを削除します。詳細については、Cnalphanumonlyを参照して。

中国語アナライザの機能`は`、次のカスタムアナライザの設定と同等です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "tokenizer": "jieba",
    "filter": ["cnalphanumonly"]
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("tokenizer", "jieba");
analyzerParams.put("filter", Arrays.asList("cnalphanumonly"));
```

</TabItem>
</Tabs>

### コンフィギュレーション{#}

フィールドに`中国`語アナライザを適用するには、単に`type`を`中国`語に`設定します`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
analyzer_params = {
    "type": "chinese",
}
```

</TabItem>

<TabItem value='java'>

```java
Map<String, Object> analyzerParams = new HashMap<>();
analyzerParams.put("type", "chinese");
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<p>この<code>中国</code>語アナライザは、任意のパラメータを受け付けません。</p>

</Admonition>

### 出力の例{#}

ここでは、`中国`のアナライザーがテキストを処理する方法を紹介します。

**オリジナルテキスト**:

```python
"Milvus 是一个高性能、可扩展的向量数据库！"
```

**予想される出力**:

```python
["Milvus", "是", "一个", "高性", "性能", "高性能", "可", "扩展", "的", "向量", "数据", "据库", "数据库"]
```

