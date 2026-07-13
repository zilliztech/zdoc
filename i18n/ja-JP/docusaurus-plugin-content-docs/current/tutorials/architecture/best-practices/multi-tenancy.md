---
title: "マルチテナンシーの実装 | Cloud"
slug: /multi-tenancy
sidebar_label: "マルチテナンシーの実装"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud におけるマルチテナンシーとは、テナントと呼ばれる複数の顧客またはチームが、分離されたデータ環境を維持しながら同じ cluster を共有することを意味します。 | Cloud"
type: origin
token: R8amwM1K6iBDLuk0KcEcHJxtnhb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# マルチテナンシーの実装

Zilliz Cloud におけるマルチテナンシーとは、**テナント**と呼ばれる複数の顧客またはチームが、分離されたデータ環境を維持しながら同じ cluster を共有することを意味します。 

Zilliz Cloud は 4 つのマルチテナンシー戦略をサポートしており、それぞれスケーラビリティ、データ分離、柔軟性の間で異なるトレードオフを提供します。このガイドでは各オプションを説明し、ユースケースに最適な戦略を選択できるようにします。

## マルチテナンシー戦略\{#multi-tenancy-strategies}

Zilliz Cloud は、**Database**、**Collection**、**Partition**、**Partition Key** の 4 つのレベルでマルチテナンシーをサポートしています。 

### Database レベルのマルチテナンシー\{#database-level-multi-tenancy}

Database レベルのマルチテナンシーでは、各テナントに 1 つ以上の collection を含む対応する [database](./database-concept) が割り当てられます。 

![NVV9w0w49hZJ61bNzG4cdi9gn6C](https://zdoc-images.s3.us-west-2.amazonaws.com/NVV9w0w49hZJ61bNzG4cdi9gn6C.png)

- **スケーラビリティ**: Database レベルのマルチテナンシー戦略は、Zilliz Cloud の Dedicated clusters でのみ利用可能で、最大 1,024 テナントをサポートします。

- **データ分離**: 各 database 内のデータは完全に分離されており、規制対象の環境や厳格なコンプライアンス要件を持つ顧客に適したエンタープライズグレードのデータ分離を提供します。

- **柔軟性**: 各 database は異なるスキーマを持つ collection を持つことができるため、非常に柔軟なデータ構成が可能になり、各テナントが独自のデータスキーマを持つことができます。

- **その他**: この戦略は RBAC もサポートしており、テナントごとにユーザーアクセスをきめ細かく制御できます。さらに、特定のテナントのデータを柔軟に load または release して、ホットデータとコールドデータを効果的に管理できます。

### Collection レベルのマルチテナンシー\{#collection-level-multi-tenancy}

Collection レベルのマルチテナンシーでは、各テナントに [collection](./manage-collections) が割り当てられ、強力なデータ分離を提供します。 

![SNxNwi64ChMFdubYKmrcGOH5ncg](https://zdoc-images.s3.us-west-2.amazonaws.com/SNxNwi64ChMFdubYKmrcGOH5ncg.png)

- **スケーラビリティ**: 1 つの cluster は最大 16,384 個の collection を保持できるため、この戦略では cluster 内で同数のテナントに対応できます。

- **データ分離**: Collection は互いに物理的に分離されています。この戦略は強力なデータ分離を提供します。

- **柔軟性**: この戦略では、各 collection が独自のスキーマを持つことができ、異なるデータスキーマを持つテナントに対応できます。

- **その他**: この戦略は RBAC もサポートしており、テナントに対するきめ細かなアクセス制御が可能です。さらに、特定のテナントのデータを柔軟に load または release して、ホットデータとコールドデータを効果的に管理できます。

### Partition レベルのマルチテナンシー\{#partition-level-multi-tenancy}

Partition レベルのマルチテナンシーでは、各テナントは共有 collection 内に手動で作成された [partition](./manage-partitions) に割り当てられます。 

![D5cawfOk0hKkJmbJwHwc54a5n4f](https://zdoc-images.s3.us-west-2.amazonaws.com/D5cawfOk0hKkJmbJwHwc54a5n4f.png)

- **スケーラビリティ**: 1 つの collection は collection あたり最大 1,024 個の partition を保持でき、その中で同数のテナントに対応できます。

- **データ分離**: 各テナントのデータは partition によって物理的に分離されます。

- **柔軟性**: この戦略では、すべてのテナントが同じデータスキーマを共有する必要があります。また、partition は手動で作成する必要があります。

- **その他**: RBAC は partition レベルではサポートされていません。テナントは個別に、または複数の partition にわたってクエリできるため、このアプローチはテナントセグメント全体にわたる集約クエリや分析を伴うシナリオに適しています。さらに、特定のテナントのデータを柔軟に load または release して、ホットデータとコールドデータを効果的に管理できます。

### Partition key レベルのマルチテナンシー\{#partition-key-level-multi-tenancy}

この戦略では、すべてのテナントが単一の collection とスキーマを共有しますが、各テナントのデータは [partition key](./use-partition-key) 値に基づいて、物理的に分離された 16 個の partition に自動的にルーティングされます。各物理 partition には複数のテナントを含めることができますが、異なるテナントのデータは論理的に分離されたままです。 

![GzOrwUHnEhaPGybcp7ActPwsnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/GzOrwUHnEhaPGybcp7ActPwsnMh.png)

- **スケーラビリティ**: Partition key レベルの戦略は最もスケーラブルなアプローチを提供し、数百万のテナントをサポートします。

- **データ分離**: 複数のテナントが物理 partition を共有できるため、この戦略のデータ分離は比較的弱くなります。

- **柔軟性**: すべてのテナントが同じデータスキーマを共有する必要があるため、この戦略のデータ柔軟性は限定的です。

- **その他**: RBAC は partition-key レベルではサポートされていません。テナントは個別に、または複数の partition にわたってクエリできるため、このアプローチはテナントセグメント全体にわたる集約クエリや分析を伴うシナリオに適しています。

## 適切なマルチテナンシー戦略の選択\{#choosing-the-right-multi-tenancy-strategy}

以下の表は、4 つのレベルのマルチテナンシー戦略を包括的に比較したものです。

|  | **Database レベル** | **Collection レベル** | **Partition レベル** | **Partition key レベル** |
| --- | --- | --- | --- | --- |
| **Cluster デプロイオプション** | Dedicated のみ | すべてのデプロイオプション | すべてのデプロイオプション | すべてのデプロイオプション |
| **データ分離** | 物理 | 物理 | 物理 | 物理 + 論理 |
| **最大テナント数** | 1024 | cluster デプロイオプションとプロジェクトプランに応じて最大 16,384。<br/>[Zilliz Cloud Limits](./limits#collections) を参照 | cluster デプロイオプションとプロジェクトプランに応じて collection あたり最大 1,024。<br/>[Zilliz Cloud Limits](./limits) を参照 | 数百万 |
| **データスキーマの柔軟性** | 高 | 中 | 低 | 低 |
| **RBAC サポート** | あり | あり | なし | なし |
| **検索パフォーマンス** | 強 | 強 | 中 | 中 |
| **クロステナント検索のサポート** | なし | なし | あり | あり |
| **ホットデータとコールドデータの効果的な処理のサポート** | あり | あり | あり | なし<br/>現在、partition key レベルの戦略ではサポートされていません。ただし、大量のテナントがあり、ホットデータとコールドデータの効果的な処理が必要な場合は、[お問い合わせ](https://zilliz.com/contact-sales)ください。 |

Zilliz Cloud でマルチテナンシー戦略を選択する際には、いくつかの要素を考慮する必要があります。

1. **スケーラビリティ:** Partition Key > Partition > Collection > Database

    非常に多数のテナント（数百万以上）をサポートすることを想定している場合は、partition key レベルの戦略を使用します。

1. **強力なデータ分離要件**: Database = Collection > Partition > Partition Key

    厳格な物理データ分離要件がある場合は、database、collection、または partition レベルの戦略を選択します。 

1. **各テナントのデータに対する柔軟なデータスキーマ:** Database > Collection > Partition = Partition Key

    Database レベルおよび collection レベルの戦略は、データスキーマに完全な柔軟性を提供します。テナントのデータ構造が異なる場合は、database レベルまたは collection レベルのマルチテナンシーを選択します。

1. **その他**

    1. **パフォーマンス:** 検索パフォーマンスは、index、検索パラメータ、マシン構成など、さまざまな要因によって決まります。Zilliz Cloud はパフォーマンスチューニングもサポートしています。マルチテナンシー戦略を選択する前に、実際のパフォーマンスをテストすることを推奨します。

    1. **ホットデータとコールドデータの効果的な処理**: 現在、database レベル、collection レベル、partition レベルの戦略はいずれもホットデータとコールドデータの処理をサポートしています。Partition key レベルの戦略を選択したいが、ホットデータとコールドデータの処理が必要な場合は、[お問い合わせ](https://zilliz.com/contact-sales)ください。

    1. **クロステナント検索**: Partition レベルおよび partition-key レベルの戦略のみがクロステナントクエリをサポートしています。
