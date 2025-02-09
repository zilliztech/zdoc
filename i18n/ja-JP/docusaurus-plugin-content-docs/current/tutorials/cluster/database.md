---
title: "データベース | Cloud"
slug: /database
sidebar_label: "データベース"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、クラスタとコレクションの間にデータベースレイヤーを導入し、マルチテナントをサポートしながら、データをより効率的に管理および整理する方法を提供します。 | Cloud"
type: origin
token: Pj1dwyk1SibbFPkknVUcFtK3nKe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database

---

import Admonition from '@theme/Admonition';


# データベース

Zilliz Cloudは、クラスタとコレクションの間に**データベース**レイヤーを導入し、マルチテナントをサポートしながら、データをより効率的に管理および整理する方法を提供します。

## データベースとは何ですか{#what-is-a-database}

Zilliz Cloudでは、データベースがデータの整理と管理のための論理ユニットとして機能します。データセキュリティを強化し、マルチテナントを実現するために、複数のデータベースを作成して、異なるアプリケーションやテナントのデータを論理的に分離することができます。例えば、ユーザーAのデータを保存するデータベースと、ユーザーBのデータを保存する別のデータベースを作成します。

Zilliz Cloudでは、リソースは以下の階層順序で構成されています。

![Ucc1wbR4Eh3vLbbGE5PcutU8nzf](/img/ja-JP/Ucc1wbR4Eh3vLbbGE5PcutU8nzf.png)

データベースの概念は専用クラスタにのみ利用可能であることに注意することができます。サーバーレスおよびフリークラスタにはデータベースがありません。

## 前提条件{#prerequisites}

データベースを管理するには、**組織オーナー**または**プロジェクト管理者**のアクセスが必要です。

## データベースの作成{#create-database}

データベースは専用クラスタでのみ作成できます。クラスタを作成すると、デフォルトのデータベースが作成されます。

専用クラスターで最大1,024のデータベースを作成できます。

![create-database](/img/ja-JP/create-database.png)

作成したコレクションを別のデータベースに移動することもできます。詳細については、「[コレクションの管理(コンソール)](./drop-collection)」を参照してください。

## データベースを削除{#drop-database}

デフォルトのデータベースは削除できません。

データベースを削除する前に、まずデータベース内のすべてのコレクションを削除する必要があります。

![drop-database](/img/ja-JP/drop-database.png)

