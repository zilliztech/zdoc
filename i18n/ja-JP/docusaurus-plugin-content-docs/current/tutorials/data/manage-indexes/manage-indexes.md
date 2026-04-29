---
title: "インデックスの管理 | Cloud"
slug: /manage-indexes
sidebar_key: manage-indexes
sidebar_label: "インデックス"
beta: FALSE
notebook: FALSE
description: "SDK を使用してベクトルフィールドとスカラーフィールドのインデックスを操作する方法を学びます。| Cloud"
type: origin
token: NDLBwtFIuihc5wkq37KchzqLnrc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - クラウド
  - インデックス
  - 管理

---

import Admonition from '@theme/Admonition';


# インデックスの管理

SDK を使用して、ベクトルフィールドおよびスカラーフィールドのインデックスを操作する方法について学びます。

<Admonition type="info" icon="📘" title="Notes">

<p>コレクションが自動的にインデックス化されロードされるかどうかは、コレクションの作成方法によって異なります。以下のシナリオでは、コレクションは作成時に自動的にロードされます。</p>
<ul>
<li><p>コンソール上。</p></li>
<li><p><a href="/reference/create-collection">RESTful API の使用</a>。</p></li>
<li><p><a href="./undefined">インデックスパラメータを指定した該当する SDK の使用。</a></p></li>
</ul>

<p>また、自動的にロードされないコレクションを作成し、インデックスの管理を独自に開始することもできます。</p>

</Admonition>

## 目次\{#contents}

この章では、ベクトルフィールドおよびスカラーフィールドのコレクションインデックスを管理する方法について説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />