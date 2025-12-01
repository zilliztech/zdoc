---
title: "インデックスの管理 | BYOC"
slug: /manage-indexes
sidebar_label: "インデックスの管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "SDKを介してベクトルフィールドとスカラーフィールドのインデックスを操作する方法について学びます。| BYOC"
type: origin
token: NDLBwtFIuihc5wkq37KchzqLnrc
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - インデックス
  - 管理
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - milvus ベクトルデータベース

---

import Admonition from '@theme/Admonition';


# インデックスの管理

SDKを介してベクトルフィールドとスカラーフィールドのインデックスを操作する方法について学びます。

<Admonition type="info" icon="📘" title="備考">

<p>コレクションが自動的にインデックス化およびロードされるかどうかは、コレクションの作成方法によって異なります。以下のシナリオでは、コレクションは作成時に自動的にロードされます。</p>
<ul>
<li><p>コンソール上での作成。</p></li>
<li><p><a href="/reference/create-collection">RESTful APIを使用する場合</a>。</p></li>
<li><p><a href="./manage-collections-sdks">インデックスパラメータを指定した適切なSDKを使用する場合</a>。</p></li>
</ul>
<p>また、自動的にロードされないコレクションを作成し、自分でインデックスを管理することもできます。</p>

</Admonition>

## コンテンツ\{#contents}

この章では、ベクトルフィールドとスカラーフィールドのコレクションインデックスの管理方法について説明します。

import DocCardList from '@theme/DocCardList';

<DocCardList />