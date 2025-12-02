---
title: "インデックスの管理 | Cloud"
slug: /manage-indexes
sidebar_label: "インデックスの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "SDKを介してベクトルおよびスカラー・フィールドのインデックスを操作する方法を学びます。 | Cloud"
type: origin
token: NDLBwtFIuihc5wkq37KchzqLnrc
sidebar_position: 4
keywords:
  - zilliz
  - vector database
  - cloud
  - index
  - manage
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';


# インデックスの管理

SDKを介してベクトルおよびスカラー・フィールドのインデックスを操作する方法を学びます。

<Admonition type="info" icon="📘" title="注意">

<p>コレクションが自動的にインデックス化されロードされるかどうかは、コレクションの作成方法によって異なります。以下のシナリオでは、コレクションは作成時に自動的にロードされます。</p>
<ul>
<li><p>コンソール上での作成。</p></li>
<li><p><a href="/reference/create-collection">RESTful APIを使用した作成</a>。</p></li>
<li><p><a href="./manage-collections-sdks">インデックスパラメータを指定して適用可能なSDKを使用した作成</a>。</p></li>
</ul>
<p>自動的にロードされないコレクションを作成し、インデックスを自分で管理することも可能です。</p>

</Admonition>

## コンテンツ\{#contents}

この章では、ベクトルおよびスカラー・フィールドのコレクションインデックスを管理する方法を学びます。

import DocCardList from '@theme/DocCardList';

<DocCardList />