---
title: "BYOC の請求を理解する | BYOC"
slug: /understand-byoc-billing
sidebar_label: "BYOC の請求を理解する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このガイドでは、契約済み vCPU 容量、契約容量を超えた使用量、請求書の表示、およびライセンス済み容量に達した際の使用制御を含め、Zilliz Cloud における BYOC の請求の仕組みを説明します。 | BYOC"
type: origin
token: VsLcwDK6SiGs0CkJ7i0cmRYWnof
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# BYOC の請求を理解する

このガイドでは、契約済み vCPU 容量、契約容量を超えた使用量、請求書の表示、およびライセンス済み容量に達した際の使用制御を含め、Zilliz Cloud における BYOC の請求の仕組みを説明します。

BYOC デプロイメントでは、Zilliz Cloud は契約ベースの請求モデルを使用します。お客様の組織は、契約でライセンス済みの vCPU 容量をコミットします。オンデマンド使用が有効になっている場合、契約済み容量を超える使用量は追跡され、`vCPU-hour` の使用量に基づいて別途請求されます。

## 請求モデル\{#billing-model}

BYOC の請求は 2 つの部分で構成されます。

| 請求コンポーネント | 説明 |
| --- | --- |
| Committed vCPU | 契約を通じて購入した vCPU 容量です。これは、BYOC 組織で利用可能なベースラインのライセンス済み容量です。 |
| On-demand vCPU | 契約済み vCPU 容量を超えた使用量です。オンデマンド使用が有効な場合、Zilliz Cloud は超過分を `vCPU-hour` で追跡し、月次でそのコストを表示します。 |

一般的には、次のようになります。

```plaintext
Total BYOC cost = Committed capacity cost + On-demand cost beyond commitment
```

<Admonition type="info" icon="📘" title="Note">

請求書は、契約容量を超えた使用量と推定料金を要約するために使用されます。実際の支払いおよび精算条件は、契約内容によって異なる場合があります。ご不明な点がある場合は、担当のアカウントエグゼクティブチームまでお問い合わせください。

</Admonition>

## Committed vCPU\{#committed-vcpu}

Committed vCPU は、BYOC 契約に含まれる vCPU 容量です。契約済み容量は、BYOC 組織におけるライセンス済み使用量のベースラインを定義します。

Committed vCPU の価格は契約ベースであり、段階的価格設定が適用される場合があります。契約済み容量が大きいほど、より低い単価が適用される可能性があります。以下の表は、段階的な vCPU 単価の例を示しています。

| **段階 (vCPU)** | **単価 (vCPU/年)** |
| --- | --- |
| 40 | &#36;1000 |
| 41-250 | &#36;900 |
| 251-500 | &#36;800 |
| 500-1000 | &#36;700 |
| 1001-5000 | &#36;600 |
| 5000+ | &#36;500 |

正確な価格については、契約書を参照するか、担当のアカウントエグゼクティブチームにお問い合わせください。

## On-demand vCPU\{#on-demand-vcpu}

BYOC デプロイメントでオンデマンド使用を有効にするには、担当のアカウントエグゼクティブチームに連絡してください。オンデマンド使用が有効で、実際の BYOC 使用量が契約済み vCPU 容量を超えた場合、Zilliz Cloud は超過分を On-demand vCPU 使用量として記録します。

オンデマンド使用量は `vCPU-hour` で測定されます。 

次の式は、オンデマンド時間単価の計算方法を示しています。

```plaintext
On-demand hourly unit price = applicable committed vCPU unit price / (365 × 24)
```

適用される単価は、契約済み vCPU 容量または契約条件によって適用される価格帯に基づきます。超過した使用量は累積され、請求期間ごとに表示されます。

### 例\{#example}

適用される Committed vCPU の単価が `$900 / vCPU / year` であるとします。時間単位の On-Demand 単価は次のように計算されます。

```plaintext
$900 / (365 × 24) ≈ $0.1027 / vCPU-hour
```

請求期間中に使用量が契約済み容量を `100 vCPU-hours` 超過した場合、推定される On-demand vCPU 使用コストは次のとおりです。

```plaintext
100 × $0.1027 = $10.27
```

## ライセンス済み容量に達した場合\{#when-licensed-capacity-is-reached}

現在の BYOC 使用量がライセンス済み容量に達し、オンデマンド使用が有効になっていない場合、Zilliz Cloud は使用量をさらに増やす操作をブロックすることがあります。

| 操作 | 動作 |
| --- | --- |
| Create cluster | 新しい cluster の作成がブロックされる場合があります。 |
| Scale Query CU | Query CU の増加がブロックされる場合があります。<br/>自動スケーリング用の最小または最大 Query CU の増加もブロックされる場合があります。 |
| Scale replica | replica の増加がブロックされる場合があります。<br/>自動スケーリング用の最小または最大 replica 数の増加もブロックされる場合があります。 |

操作がブロックされた場合、*"Current usage has reached the limit. Please contact us to expand your licensed capacity."* というメッセージが表示されることがあります。

リソースの拡張を継続するには、契約内容に応じて、契約済み容量を増やすかオンデマンド使用を有効にするために、担当のアカウントエグゼクティブチームにお問い合わせください。

## 請求書\{#invoices}

オンデマンド使用が有効で、BYOC 使用量が契約済み容量を超えた場合、Zilliz Cloud は超過使用量に対する月次の請求書レコードを表示します。請求書は、[サポートされている支払い方法](./payment-billing#payment-methods)を使用して支払うことができます。

BYOC のオンデマンド使用については、請求書の猶予期間は契約条件によって異なる場合があります。適用される猶予期間と支払いスケジュールについては、契約書を参照してください。

請求書の管理方法の詳細については、[請求書の管理](./manage-invoice)を参照してください。

<Admonition type="info" icon="📘" title="Note">

請求書の支払い期限を過ぎると、cluster の作成、query CU や replica の増加、自動スケーリングの有効化または使用を含む、リソース使用量を増加させる操作がブロックされる場合があります。

</Admonition>

## Usage ページ\{#usage-page}

**Usage** ページでは、契約済み容量に対する BYOC 使用量を確認できます。

オンデマンド使用が有効な場合、このページには `vCPU-hour` 単位の日次超過使用量を表示できます。契約済み部分はベースライン容量として表示され、コミットメントを超えた使用量のみがオンデマンド使用量としてカウントされます。

このページを使用すると、いつ超過が発生したか、どのプロジェクトまたはリージョンが超過に寄与したか、またどれだけの使用量が契約済み容量を超えたかを把握できます。 

詳細については、[コストの分析](./analyze-cost)を参照してください。

## ベストプラクティス\{#best-practices}

- 予想されるベースラインの本番使用量に基づいて、契約済み vCPU 容量を選択してください。

- ワークロードがときどき契約済み容量を超える可能性がある場合は、オンデマンド使用を有効にしてください。

- 定期的に Usage ページを確認し、繰り返し発生する超過パターンを特定してください。

- 超過が頻繁または予測可能になった場合は、契約済み容量を増やしてください。

- 大規模なスケーリングイベントの前に、ライセンス済み容量とオンデマンド設定が目標構成をサポートできるかどうかを確認してください。

