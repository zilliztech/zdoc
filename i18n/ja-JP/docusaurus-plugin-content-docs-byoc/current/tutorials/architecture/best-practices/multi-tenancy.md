---
title: "マルチテナンシーを実装する | BYOC"
slug: /multi-tenancy
sidebar_label: "マルチテナンシーを実装する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud におけるマルチテナンシーとは、複数の顧客またはチーム（tenant と呼ばれる）が、分離されたデータ環境を維持しながら同じ cluster を共有することを意味します。 | BYOC"
type: origin
token: R8amwM1K6iBDLuk0KcEcHJxtnhb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# マルチテナンシーを実装する

Zilliz Cloud におけるマルチテナンシーとは、複数の顧客またはチーム（**tenant** と呼ばれる）が、分離されたデータ環境を維持しながら同じ cluster を共有することを意味します。 

Zilliz Cloud は 4 つのマルチテナンシー戦略をサポートしており、それぞれ scalability、data isolation、flexibility の間で異なるトレードオフを提供します。このガイドでは各オプションを順に説明し、ユースケースに最も適した戦略を選べるよう支援します。

## マルチテナンシー戦略\{#multi-tenancy-strategies}

Zilliz Cloud は、**Database**、**Collection**、**Partition**、**Partition Key** の 4 つのレベルでマルチテナンシーをサポートしています。 

### Database レベルのマルチテナンシー\{#database-level-multi-tenancy}

Database レベルのマルチテナンシーでは、各 tenant に 1 つ以上の collection を含む対応する [database](./database-concept) が割り当てられます。 

![NVV9w0w49hZJ61bNzG4cdi9gn6C](https://zdoc-images.s3.us-west-2.amazonaws.com/NVV9w0w49hZJ61bNzG4cdi9gn6C.png)

- **Scalability**: Database レベルのマルチテナンシー戦略は Zilliz Cloud の Dedicated cluster でのみ利用可能で、最大 1,024 tenant をサポートします。

- **Data isolation**: 各 database 内のデータは完全に分離されており、規制対象環境や厳格なコンプライアンス要件を持つ顧客に適した、エンタープライズグレードの data isolation を提供します。

- **Flexibility**: 各 database には異なる schema を持つ collection を作成できるため、非常に柔軟なデータ構成が可能であり、各 tenant が独自の data schema を持つことができます。

- **Others**: この戦略は RBAC もサポートしており、tenant ごとのユーザーアクセスをきめ細かく制御できます。さらに、特定の tenant のデータを柔軟に load または release して、hot data と cold data を効果的に管理できます。

### Collection レベルのマルチテナンシー\{#collection-level-multi-tenancy}

Collection レベルのマルチテナンシーでは、各 tenant に [collection](./manage-collections) が割り当てられ、強力な data isolation を提供します。 

![SNxNwi64ChMFdubYKmrcGOH5ncg](https://zdoc-images.s3.us-west-2.amazonaws.com/SNxNwi64ChMFdubYKmrcGOH5ncg.png)

- **Scalability**: 1 つの cluster は最大 16,384 個の collection を保持できるため、この戦略では cluster 内で同数の tenant を収容できます。

- **Data isolation**: Collection 同士は物理的に分離されています。この戦略は強力な data isolation を提供します。

- **Flexibility**: この戦略では各 collection が独自の schema を持つことができるため、異なる data schema を持つ tenant に対応できます。

- **Others**: この戦略も RBAC をサポートしており、tenant に対してきめ細かなアクセス制御が可能です。さらに、特定の tenant のデータを柔軟に load または release して、hot data と cold data を効果的に管理できます。

### Partition レベルのマルチテナンシー\{#partition-level-multi-tenancy}

Partition レベルのマルチテナンシーでは、各 tenant は共有 collection 内で手動作成された [partition](./manage-partitions) に割り当てられます。 

![D5cawfOk0hKkJmbJwHwc54a5n4f](https://zdoc-images.s3.us-west-2.amazonaws.com/D5cawfOk0hKkJmbJwHwc54a5n4f.png)

- **Scalability**: 1 つの collection は collection ごとに最大 1,024 個の partition を保持できるため、その中で同数の tenant を収容できます。

- **Data isolation**: 各 tenant のデータは partition によって物理的に分離されます。

- **Flexibility**: この戦略では、すべての tenant が同じ data schema を共有する必要があります。また、partition は手動で作成する必要があります。

- **Others**: Partition レベルでは RBAC はサポートされていません。Tenant は個別にも、複数の partition をまたいでもクエリできるため、このアプローチは tenant セグメント全体に対する集約クエリや分析を伴うシナリオに適しています。さらに、特定の tenant のデータを柔軟に load または release して、hot data と cold data を効果的に管理できます。

### Partition key レベルのマルチテナンシー\{#partition-key-level-multi-tenancy}

この戦略では、すべての tenant が 1 つの collection と schema を共有しますが、各 tenant のデータは [partition key](./use-partition-key) の値に基づいて、16 個の物理的に分離された partition に自動的にルーティングされます。各物理 partition には複数の tenant を含めることができますが、異なる tenant のデータは論理的に分離されたままです。 

![GzOrwUHnEhaPGybcp7ActPwsnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/GzOrwUHnEhaPGybcp7ActPwsnMh.png)

- **Scalability**: Partition key レベルの戦略は最も高い scalability を提供し、数百万の tenant をサポートできます。

- **Data isolation**: 複数の tenant が 1 つの物理 partition を共有できるため、この戦略の data isolation は比較的弱くなります。

- **Flexibility**: すべての tenant が同じ data schema を共有する必要があるため、この戦略のデータ柔軟性は限定的です。

- **Others**: Partition-key レベルでは RBAC はサポートされていません。Tenant は個別にも、複数の partition をまたいでもクエリできるため、このアプローチは tenant セグメント全体に対する集約クエリや分析を伴うシナリオに適しています。

## 適切なマルチテナンシー戦略の選択\{#choosing-the-right-multi-tenancy-strategy}

以下の表は、4 つのレベルのマルチテナンシー戦略を包括的に比較したものです。

|  | **Database-level** | **Collection-level** | **Partition-level** | **Partition key-level** |
| --- | --- | --- | --- | --- |
| **Cluster deployment option** | Dedicated のみ | すべての deployment option | すべての deployment option | すべての deployment option |
| **Data Isolation** | Physical | Physical | Physical | Physical + Logical |
| **Max. number of tenants** | 1024 | cluster の deployment option と project plan に応じて最大 16,384。<br/>[Zilliz Cloud Limits](./limits#collections) を参照 | cluster の deployment option と project plan に応じて、collection ごとに最大 1,024。<br/>[Zilliz Cloud Limits](./limits) を参照 | 数百万 |
| **Data schema flexibility** | High | Medium | Low | Low |
| **RBAC support** | Yes | Yes | No | No |
| **Search performance** | Strong | Strong | Medium | Medium |
| **Cross-tenant search support** | No | No | Yes | Yes |
| **Support for effective handling of hot and cold data** | Yes | Yes | Yes | No<br/>現在、partition key-level 戦略ではサポートされていません。ただし、tenant 数が非常に多く、hot data と cold data の効果的な処理が必要な場合は、[お問い合わせ](https://zilliz.com/contact-sales)ください。 |

Zilliz Cloud でマルチテナンシー戦略を選択する際には、いくつか考慮すべき要素があります。

1. **Scalability:** Partition Key > Partition > Collection > Database

    非常に多くの tenant（数百万以上）をサポートすることが想定される場合は、partition key-level 戦略を使用してください。

1. **強力な data isolation 要件**: Database = Collection > Partition > Partition Key

    物理的な data isolation に対する厳格な要件がある場合は、database、collection、または partition-level 戦略を選択してください。 

1. **各 tenant のデータに対する柔軟な data schema:** Database > Collection > Partition = Partition Key

    Database-level 戦略と collection-level 戦略は、data schema に対して完全な柔軟性を提供します。tenant のデータ構造がそれぞれ異なる場合は、database-level または collection-level のマルチテナンシーを選択してください。

1. **その他**

    1. **Performance:** Search performance は、index、search parameters、マシン構成など、さまざまな要因によって決まります。Zilliz Cloud は performance-tuning もサポートしています。マルチテナンシー戦略を選択する前に、実際の performance をテストすることを推奨します。

    1. **hot data と cold data の効果的な処理**: 現在、database-level、collection-level、partition-level の各戦略はすべて hot data と cold data の処理をサポートしています。partition key-level 戦略を選択したいものの、hot data と cold data の処理も必要な場合は、[お問い合わせ](https://zilliz.com/contact-sales)ください。

    1. **Cross-tenant searches**: Cross-tenant query をサポートしているのは、partition-level と partition-key-level の戦略のみです。

