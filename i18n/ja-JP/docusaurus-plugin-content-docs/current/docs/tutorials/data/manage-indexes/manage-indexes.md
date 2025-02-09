---
title: "インデックスの管理 | Cloud"
slug: /manage-indexes
sidebar_label: "インデックスの管理"
beta: FALSE
notebook: FALSE
description: "SDKを使用してベクトルおよびスカラーフィールドのインデックスを操作する方法を学びます。 | Cloud"
type: origin
token: BOGFwbkUfiJeACkG6nec4MnPn7d
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - index
  - manage
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication

---

import Admonition from '@theme/Admonition';


# インデックスの管理

SDKを使用してベクトルおよびスカラーフィールドのインデックスを操作する方法を学びます。

<Admonition type="info" icon="📘" title="ノート">

<p>コレクションが自動的にインデックス化されて読み込まれるかどうかは、コレクションの作成方法によって異なります。次のシナリオでは、コレクションは作成時に自動的に読み込まれます。</p>
<p><include targte="zilliz"></p>
<ul>
<li>コンソールで。</li>
</ul>
<p></include></p>
<ul>
<li><p><a href="/reference/create-collection">RESTful APIを使用する</a>。</p></li>
<li><p><a href="null">SDKを使用してコレクションを即座に作成する</a>。</p></li>
<li><p><a href="null">SDKを使用してコレクションを作成するとインデックスをセットする</a>。</p></li>
</ul>
<p>自動的にロードされないコレクションを作成して、独自にインデックスの管理を開始することもできます。</p>

</Admonition>

## コンテンツ{#contents}{#contents}

この章では、ベクトルフィールドとスカラーフィールドのコレクションインデックスを管理する方法について説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />