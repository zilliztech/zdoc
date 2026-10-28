---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は AWS、Google Cloud、Microsoft Azure で利用できます。このページを使用してリージョンを探し、目的のデプロイオプションと必要な機能がそのリージョンでサポートされているかどうかを確認してください。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は AWS、Google Cloud、Microsoft Azure で利用できます。このページを使用してリージョンを探し、目的のデプロイオプションと必要な機能がそのリージョンでサポートされているかどうかを確認してください。

## クラウドリージョンを選択する\{#choose-a-cloud-region}

リージョンを選択する際は、次の点を考慮してください。

- **データレジデンシー:** データレジデンシーとコンプライアンスの要件を満たすリージョンを選択してください。

- **アプリケーションの場所:** ネットワークレイテンシーを抑えるため、クラスターを、アクセスするアプリケーションサービスに近い場所に配置してください。

- **可用性:** デプロイオプションと必要な機能がそのリージョンで利用可能かどうかを確認してください。

- **データ転送:** リージョン間またはクラウドプロバイダー間でデータを転送する際のレイテンシーとコストを考慮してください。

## サポートされているリージョン\{#supported-regions}

次の表に、各クラウドプロバイダーでサポートされているリージョンを示します。Zilliz-Managed Cloud では、常時稼働のコンピューティング（[サービングクラスター](./manage-cluster)）と[オンデマンドコンピューティング](./on-demand-cluster)の可用性が個別に表示されます。BYOC の可用性は別途記載されています。チェックマーク（✅）は、そのリージョンで利用可能であることを示します。

<Admonition type="info" title="Note">

必要なリージョンが一覧にない場合は、[リージョンリクエストを送信](https://zilliz.com/all-regions#region-request)してください。

Zilliz Cloud を独自のクラウド環境（BYOC）にデプロイするには、[営業担当者にお問い合わせ](https://zilliz.com/contact-sales)ください。

</Admonition>

### AWS\{#aws}

<CloudRegions provider="aws" />

### Google Cloud\{#google-cloud}

<CloudRegions provider="gcp" />

### Microsoft Azure\{#microsoft-azure}

<CloudRegions provider="azure" />

## リージョン別の機能の可用性\{#feature-availability-by-region}

<CloudFeatures matrix="features" />

<Admonition type="info" title="Note">

リージョンで利用可能であることは、すべてのデプロイオプションやプロジェクトプランで利用できることを保証するものではありません。構成とバージョンの要件については各機能のドキュメントを、プランの可用性については[デプロイとプランの比較](./select-zilliz-cloud-service-plans)を参照してください。

</Admonition>
