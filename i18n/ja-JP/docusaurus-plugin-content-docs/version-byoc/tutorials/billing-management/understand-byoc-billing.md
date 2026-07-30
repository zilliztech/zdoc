---
title: "BYOC の請求について | BYOC"
slug: /understand-byoc-billing
sidebar_key: understand-byoc-billing
sidebar_label: "BYOC の請求について"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "BYOC の請求は、契約済みの vCPU キャパシティに基づきます。BYOC を購入すると、一定量の vCPU キャパシティを契約し、それが BYOC 組織で使用できるライセンス済みキャパシティとなります。 | BYOC"
type: origin
token: VsLcwDK6SiGs0CkJ7i0cmRYWnof
sidebar_position: 0
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - 支払い
  - 請求
  - byoc
---

import Admonition from '@theme/Admonition';

# BYOC の請求について

BYOC の請求は、契約済みの vCPU キャパシティに基づきます。BYOC を購入すると、一定量の vCPU キャパシティを契約し、それが BYOC 組織で使用できるライセンス済みキャパシティとなります。

Zilliz Cloud は、**契約のみ**と**契約 + オンデマンド**という 2 つの BYOC 購入オプションをサポートしています。

このガイドでは、BYOC の購入オプションと Zilliz Cloud の請求の仕組みについて説明します。

## BYOC の購入オプション\{#byoc-purchase-options}

ワークロードの予測可能性に最も適したオプションを選択してください。

<table>
   <tr><th><p><strong>購入オプション</strong></p></th><th><p><strong>適した用途</strong></p></th><th><p><strong>請求の仕組み</strong></p></th></tr>
   <tr><td><p>契約のみ</p></td><td><p>安定して予測可能なワークロード</p></td><td><p>契約を通じて vCPU キャパシティを購入します。使用量に基づく月次請求書は Zilliz Cloud で生成されません。支払いは Advance Pay やクラウド Marketplace のプライベートオファーなど、契約に従って処理されます。追加のキャパシティが必要な場合は、担当アカウントチームに連絡して契約を更新または拡張してください。ライセンス済みキャパシティは <strong>License</strong> ページで確認できます。</p></td></tr>
   <tr><td><p>契約 + オンデマンド</p></td><td><p>予測可能なベースラインと一時的な使用量の急増があるワークロード</p></td><td><p>契約済み vCPU キャパシティは最低契約使用量であり、契約に従って処理されます。契約キャパシティを超えた使用量はオンデマンド使用量として課金されます。Zilliz Cloud は超過分の月次請求書を生成するため、請求書を支払うには<a href="./payment-billing#payment-methods">サポートされている支払い方法</a>を追加する必要があります。</p></td></tr>
</table>

## 契約済み vCPU\{#committed-vcpu}

契約済み vCPU は、BYOC 契約に含まれる vCPU キャパシティです。BYOC 組織のライセンス済み使用量のベースラインを定義します。

料金は契約に基づき、段階制料金が適用される場合があります。正確な料金については、契約を参照するか、担当アカウントチームにお問い合わせください。

## オンデマンド vCPU\{#on-demand-vcpu}

オンデマンド vCPU は、**契約 + オンデマンド**オプションにのみ適用されます。BYOC デプロイメントでオンデマンド使用量を有効にするには、担当アカウントチームにお問い合わせください。

実際の BYOC 使用量が契約済み vCPU キャパシティを超えると、超過分がオンデマンド vCPU 使用量として `vCPU-minute` 単位で記録されます。

```plaintext
オンデマンドの 1 分あたり単価 = 適用される契約済み vCPU 単価 / (365 × 24 × 60)
```

適用単価は、契約済み vCPU キャパシティで適用される料金階層または契約条件に基づきます。

### 例\{#example}

契約済み vCPU の適用単価が `$900 / vCPU / year` の場合、1 分あたりのオンデマンド単価は次のようになります。

```plaintext
$900 / (365 × 24 × 60) ≈ $0.0017 / vCPU / minute
```

請求期間中に契約キャパシティを `600 vCPU-minute` 超過した場合、推定コストは次のとおりです。

```plaintext
600 × $0.0017 = $1.02
```

## ライセンス済みキャパシティに達した場合\{#when-licensed-capacity-is-reached}

現在の BYOC 使用量がライセンス済みキャパシティに達し、オンデマンド使用量が有効でない場合、使用量をさらに増やす操作がブロックされることがあります。

<table>
   <tr><th><p>操作</p></th><th><p>動作</p></th></tr>
   <tr><td><p>クラスターを作成</p></td><td><p>新しいクラスターの作成がブロックされる場合があります。</p></td></tr>
   <tr><td><p>Query CU をスケール</p></td><td><p>Query CU の増加や、オートスケーリングの最小・最大 Query CU の増加がブロックされる場合があります。</p></td></tr>
   <tr><td><p>レプリカをスケール</p></td><td><p>レプリカ数の増加や、オートスケーリングの最小・最大レプリカ数の増加がブロックされる場合があります。</p></td></tr>
</table>

操作がブロックされると、*「Current usage has reached the limit. Please contact us to expand your licensed capacity.」*というメッセージが表示される場合があります。

リソースをさらに拡張するには、契約に応じて契約済みキャパシティを増やすか、オンデマンド使用量を有効にしてください。

## 請求書\{#invoices}

契約 + オンデマンドでは、契約済み vCPU キャパシティを超えたオンデマンド使用量について、Zilliz Cloud が月次請求書を生成します。請求書を支払うには、[サポートされている支払い方法](./payment-billing#payment-methods)を追加する必要があります。

請求期間と支払いスケジュールは契約条件によって異なる場合があります。詳細は契約を参照してください。請求書の管理については、[請求書を管理](./manage-invoice)を参照してください。

<Admonition type="info" icon="📘" title="Note">

請求書が延滞すると、クラスターの作成、Query CU やレプリカの増加、オートスケーリングの有効化や使用など、リソース使用量を増やす操作がブロックされる場合があります。

</Admonition>

## Usage ページ\{#usage-page}

**Usage** ページでは、契約済みキャパシティに対する BYOC 使用量を確認できます。オンデマンド使用量が有効な場合、日ごとの超過使用量が `vCPU-minute` 単位で表示されます。

このページを使用して、超過が発生した日時、超過に寄与したプロジェクトやリージョン、契約量を超えた使用量を確認できます。詳細については、[コストの分析](./analyze-cost)を参照してください。

## ベストプラクティス\{#best-practices}

- 想定される本番環境のベースライン使用量に基づいて、契約済み vCPU キャパシティを選択します。

- ワークロードが一時的に契約キャパシティを超える可能性がある場合は、オンデマンド使用量を有効にします。

- Usage ページを定期的に確認して、繰り返し発生する超過パターンを特定します。

- 超過が頻繁または予測可能になった場合は、契約済みキャパシティを増やします。

- 大規模なスケーリングの前に、ライセンス済みキャパシティとオンデマンド設定が目標構成をサポートできることを確認します。
