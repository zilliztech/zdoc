---
title: "マルチテナンシーの実装 | Cloud"
slug: /multi-tenancy
sidebar_key: multi-tenancy
sidebar_label: "マルチテナンシーの実装"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud におけるマルチテナンシーとは、複数の顧客またはチーム（テナントと呼びます）が同じクラスターを共有しながら、データ環境を分離して維持することを意味します。| Cloud"
type: origin
token: R8amwM1K6iBDLuk0KcEcHJxtnhb
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - milvus
  - multi-tenancy

---

import Admonition from '@theme/Admonition';


# マルチテナンシーの実装

Zilliz Cloud におけるマルチテナンシーとは、複数の顧客またはチーム（**テナント**と呼ばれる）が同じクラスターを共有しながらも、それぞれ独立したデータ環境を維持することを意味します。

Zilliz Cloud では4つのマルチテナンシー戦略をサポートしており、それぞれスケーラビリティ、データ分離、柔軟性のトレードオフが異なります。このガイドでは各オプションを説明し、ユースケースに最も適した戦略を選択できるように支援します。

## マルチテナンシー戦略\{#multi-tenancy-strategies}

Zilliz Cloud では、マルチテナンシーを **データベース**（データベース）、**Collection**（コレクション）、**Partition**（パーティション）、**パーティションキー**（パーティションキー）の4つのレベルでサポートしています。

### データベースレベルのマルチテナンシー\{#database-level-multi-tenancy}

データベースレベルのマルチテナンシーでは、各テナントに1つ以上のコレクションを含む対応する[データベース](./database)が割り当てられます。

![NVV9w0w49hZJ61bNzG4cdi9gn6C](https://zdoc-images.s3.us-west-2.amazonaws.com/NVV9w0w49hZJ61bNzG4cdi9gn6C.png)

- **Scalability**: データベースレベルのマルチテナンシー戦略は Zilliz Cloud の Dedicated クラスターでのみ利用可能で、最大1,024テナントまでサポートします。

- **データ分離**: 各データベース内のデータは完全に分離されており、規制された環境や厳格なコンプライアンス要件を持つ顧客向けに、エンタープライズグレードのデータ分離を提供します。

- **柔軟性**: 各データベースは異なるスキーマを持つコレクションを保持でき、非常に柔軟なデータ構成が可能で、各テナントが独自のデータスキーマを持つことができます。

- **その他**: この戦略は RBAC もサポートしており、テナントごとのユーザーアクセスを細かく制御できます。また、特定のテナントのデータを柔軟にロードまたはリリースすることで、ホットデータとコールドデータを効果的に管理できます。

### コレクションレベルのマルチテナンシー\{#collection-level-multi-tenancy}

コレクションレベルのマルチテナンシーでは、各テナントに[コレクション](./manage-collections)が割り当てられ、強力なデータ分離を実現します。

![SNxNwi64ChMFdubYKmrcGOH5ncg](https://zdoc-images.s3.us-west-2.amazonaws.com/SNxNwi64ChMFdubYKmrcGOH5ncg.png)

- **Scalability**: クラスターは最大16,384のコレクションを保持できるため、この戦略ではクラスター内で同数のテナントを収容できます。

- **データ分離**: コレクションは物理的に互いに分離されています。この戦略は強力なデータ分離を提供します。

- **柔軟性**: この戦略では、各コレクションが独自のスキーマを持つことができ、異なるデータスキーマを持つテナントに対応できます。

- **その他**: この戦略も RBAC をサポートしており、テナント単位でのきめ細かいアクセス制御が可能です。また、特定のテナントのデータを柔軟にロードまたはリリースすることで、ホットデータとコールドデータを効果的に管理できます。

### パーティションレベルのマルチテナンシー\{#partition-level-multi-tenancy}

パーティションレベルのマルチテナンシーでは、各テナントが共有コレクション内に手動で作成された[パーティション](./manage-partitions)に割り当てられます。

![D5cawfOk0hKkJmbJwHwc54a5n4f](https://zdoc-images.s3.us-west-2.amazonaws.com/D5cawfOk0hKkJmbJwHwc54a5n4f.png)

- **Scalability**: 1つのコレクションは最大1,024のパーティションを保持できるため、コレクション内で同数のテナントを収容できます。

- **データ分離**: 各テナントのデータはパーティションによって物理的に分離されます。

- **柔軟性**: この戦略では、すべてのテナントが同じデータスキーマを共有する必要があります。また、パーティションは手動で作成する必要があります。

- **その他**: RBAC はパーティションレベルではサポートされていません。テナントは個別に、または複数のパーティションにまたがってクエリできます。そのため、テナントセグメント間での集計クエリや分析が必要なシナリオに適しています。また、特定のテナントのデータを柔軟にロードまたはリリースすることで、ホットデータとコールドデータを効果的に管理できます。

### パーティションキーレベルのマルチテナンシー\{#partition-key-level-multi-tenancy}

この戦略では、すべてのテナントが単一のコレクションとスキーマを共有しますが、各テナントのデータは[パーティションキー](./use-partition-key)の値に基づいて自動的に16の物理的に分離されたパーティションにルーティングされます。各物理パーティションには複数のテナントが含まれる可能性がありますが、異なるテナントのデータは論理的に分離されたままです。

![GzOrwUHnEhaPGybcp7ActPwsnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/GzOrwUHnEhaPGybcp7ActPwsnMh.png)

- **Scalability**: パーティションキーレベルの戦略は最もスケーラブルで、数百万のテナントをサポートします。

- **データ分離**: 複数のテナントが物理パーティションを共有する可能性があるため、この戦略のデータ分離は比較的弱いです。

- **柔軟性**: すべてのテナントが同じデータスキーマを共有する必要があるため、この戦略のデータ柔軟性は限定的です。

- **その他**: RBAC はパーティションキーレベルではサポートされていません。テナントは個別に、または複数のパーティションにまたがってクエリできます。そのため、テナントセグメント間での集計クエリや分析が必要なシナリオに適しています。

## 適切なマルチテナンシー戦略の選択\{#choosing-the-right-multi-tenancy-strategy}

以下の表は、4つのマルチテナンシー戦略を包括的に比較したものです。

<table>
   <tr>
     <th></th>
     <th><p><strong>データベース-level</strong></p></th>
     <th><p><strong>Collection-level</strong></p></th>
     <th><p><strong>Partition-level</strong></p></th>
     <th><p><strong>Partition key-level</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Cluster deployment option</strong></p></td>
     <td><p>Dedicated only</p></td>
     <td><p>All deployment options</p></td>
     <td><p>All deployment options</p></td>
     <td><p>All deployment options</p></td>
   </tr>
   <tr>
     <td><p><strong>データ Isolation</strong></p></td>
     <td><p>Physical</p></td>
     <td><p>Physical</p></td>
     <td><p>Physical</p></td>
     <td><p>Physical + Logical</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. number of tenants</strong></p></td>
     <td><p>1024</p></td>
     <td><p>Up to 16,384 depending on the cluster deployment option and project plan. </p><p>See <a href="./limits#collections">Zilliz Cloud 制限s</a></p></td>
     <td><p>Up to 1,024 per collection depending on the cluster deployment option and project plan. </p><p>See <a href="./limits">Zilliz Cloud 制限s</a></p></td>
     <td><p>Millions</p></td>
   </tr>
   <tr>
     <td><p><strong>データ schema flexibility</strong></p></td>
     <td><p>High</p></td>
     <td><p>中</p></td>
     <td><p>Low</p></td>
     <td><p>Low</p></td>
   </tr>
   <tr>
     <td><p><strong>RBAC support</strong></p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p><strong>Search performance</strong></p></td>
     <td><p>Strong</p></td>
     <td><p>Strong</p></td>
     <td><p>中</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-tenant search support</strong></p></td>
     <td><p>No</p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Support for effective handling of hot and cold data</strong></p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p><p>Currently, サポートされていません for the パーティションキー-level strategy. But if you have massive tenants and require effective handling of hot and cold data, please <a href="https://zilliz.com/contact-sales">contact us</a>.</p></td>
   </tr>
</table>

Zilliz Cloud でマルチテナンシー戦略を選択する際には、いくつかの要素を考慮する必要があります。

1. **Scalability:** パーティションキー > Partition > Collection > データベース

    数百万以上のテナントをサポートする必要がある場合は、パーティションキーレベルの戦略を使用してください。

1. **厳格なデータ分離要件**: データベース = Collection > Partition > パーティションキー

    厳格な物理的なデータ分離要件がある場合は、データベース、コレクション、またはパーティションレベルの戦略を選択してください。

1. **Flexible data schema for each tenant's data:** データベース > Collection > Partition = パーティションキー

    データベースレベルおよびコレクションレベルの戦略は、データスキーマにおいて完全な柔軟性を提供します。テナントごとに異なるデータ構造を持つ必要がある場合は、データベースレベルまたはコレクションレベルのマルチテナンシーを選択してください。

1. **その他**

    1. **パフォーマンス:** 検索パフォーマンスは、インデックス、検索パラメータ、マシン構成などさまざまな要因によって決まります。Zilliz Cloud ではパフォーマンスチューニングもサポートしています。マルチテナンシー戦略を選択する前に、実際のパフォーマンスをテストすることを推奨します。

    1. **Effective handling of hot and cold data**: 現在、データベースレベル、コレクションレベル、パーティションレベルの戦略はすべてホットデータとコールドデータの処理をサポートしています。パーティションキーレベルの戦略を選択したいがホット/コールドデータ処理が必要な場合は、[お問い合わせください](https://zilliz.com/contact-sales)。

    1. **テナント間検索**: パーティションレベルおよびパーティションキーレベルの戦略のみがテナント間検索をサポートしています。

