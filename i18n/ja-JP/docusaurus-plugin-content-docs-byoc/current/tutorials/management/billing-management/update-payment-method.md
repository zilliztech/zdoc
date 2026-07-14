---
title: "支払い方法を更新する | BYOC"
slug: /update-payment-method
sidebar_label: "支払い方法を更新する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織で有効期限切れのカードを差し替える必要がある場合、請求をクラウドマーケットプレイスに移行する場合、マーケットプレイスアカウントを切り替える場合、またはマーケットプレイス請求からクレジットカード請求に戻す場合に、支払い方法を更新できます。 | BYOC"
type: origin
token: TfzMwdLsWibd0UkGpGAcLhuInvb
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払い方法を更新する

組織で有効期限切れのカードを差し替える必要がある場合、請求をクラウドマーケットプレイスに移行する場合、マーケットプレイスアカウントを切り替える場合、またはマーケットプレイス請求からクレジットカード請求に戻す場合に、支払い方法を更新できます。

<Admonition type="info" icon="📘" title="📘 Note">

支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## サポートされている支払い方法の変更\{#supported-payment-method-changes}

Zilliz Cloud は以下の支払い方法の変更をサポートしています。

| **変更前** | **変更後** | **更新方法** |
| --- | --- | --- |
| クレジットカード | クレジットカード | Zilliz Cloud コンソールで追加済みのクレジットカードを差し替えます。 |
| クレジットカード | マーケットプレイスサブスクリプション | 対象のマーケットプレイス経由で Zilliz Cloud を購読し、そのサブスクリプションを Zilliz Cloud 組織にリンクします。<br/>サブスクリプションがリンクされると、支払い方法は自動的に更新されます。マーケットプレイスサブスクリプションにより、クレジットカード情報は自動的に置き換えられます。 |
| マーケットプレイスサブスクリプション | クレジットカード | 現在のマーケットプレイスサブスクリプションをキャンセルし、その後 Zilliz Cloud コンソールでクレジットカードを追加します。 |
| マーケットプレイスサブスクリプション | マーケットプレイスサブスクリプション | 現在のマーケットプレイスサブスクリプションをキャンセルし、新しいマーケットプレイスアカウント経由で購読して、新しいサブスクリプションを Zilliz Cloud 組織にリンクします。 |

## クレジットカードを差し替える\{#replace-a-credit-card}

手順ガイドについては、[クレジットカード](./subscribe-by-adding-credit-card#replace-a-credit-card) を参照してください。

## クレジットカードからマーケットプレイスサブスクリプションに切り替える\{#switch-from-credit-card-to-marketplace-subscription}

クレジットカード請求からマーケットプレイス請求に切り替えるには、以下の手順に従ってください。

<Procedures>

1. クラウドマーケットプレイス経由で Zilliz Cloud を購読します。

    - [AWS Marketplace](./subscribe-on-aws-marketplace)

    - [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

    - [Microsoft Marketplace](./subscribe-on-azure-marketplace)

1. 更新を確認します。

    マーケットプレイスサブスクリプションが成功すると、支払い方法は自動的に更新されます。クレジットカードを手動で削除する必要はありません。

    **Billing** ページで更新を確認できます。

</Procedures>

## マーケットプレイスサブスクリプションからクレジットカードに切り替える\{#switch-from-marketplace-subscription-to-credit-card}

マーケットプレイス請求からクレジットカード請求に切り替えるには、以下の手順に従ってください。

<Procedures>

1. 購読したクラウドマーケットプレイスで現在のサブスクリプションをキャンセルします。

1. Zilliz Cloud コンソールで **Billing** に移動します。

1. **Payment Method** セクションで [クレジットカードを追加](./subscribe-by-adding-credit-card#add-a-credit-card) します。

</Procedures>

正常に追加されると、組織はそのクレジットカードを支払い方法として使用します。

## マーケットプレイスサブスクリプション間で切り替える\{#switch-between-marketplace-subscriptions}

請求に使用するマーケットプレイスアカウントを変更する必要がある場合、AWS Marketplace の無料トライアルをアップグレードする場合、またはパブリックオファーからプライベートオファーに移行する場合に、マーケットプレイスサブスクリプション間で切り替えることができます。

必要な手順は、変更の種類によって異なります。

| **シナリオ** | **実施事項** |
| --- | --- |
| 請求に使用するマーケットプレイスアカウントを変更する | 現在のマーケットプレイスサブスクリプションをキャンセルし、新しいマーケットプレイスアカウントで再度購読して、新しいサブスクリプションを Zilliz Cloud 組織にリンクします。 |
| AWS Marketplace の無料トライアルをアップグレードする | AWS Marketplace のオファーページでアップグレードまたは購読し、その後有料サブスクリプションを Zilliz Cloud 組織にリンクします。 |
| パブリックオファーからプライベートオファーに切り替える | プライベートオファーを承諾します。プライベートオファーは以前のパブリックオファーを置き換えます。引き続き、新しいオファーを Zilliz Cloud 組織にリンクする必要があります。 |

### Marketplace アカウントを変更する\{#change-marketplace-account}

以下の例では、請求に使用する AWS Marketplace アカウントを変更する方法を示します。同じプロセスは Google Cloud Marketplace および Microsoft Marketplace にも適用されます。

<Admonition type="info" icon="📘" title="📘 Note">

サービス中断を避けるため、1時間以内に操作を完了することを推奨します。

</Admonition>

<Procedures>

1. サブスクリプションに使用した元の AWS アカウントで AWS Marketplace にサインインします。

1. Zilliz Cloud のサブスクリプションをキャンセルします。詳細については、[製品サブスクリプションをキャンセルする](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="📘 Note">

    ご安心ください。サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されません。

    </Admonition>

    AWS Marketplace がキャンセル処理を完了するまでに数分かかります。

1. 元の AWS アカウントからサインアウトします。

1. サブスクリプションに使用したい別の AWS アカウントで AWS Marketplace にサインインします。

1. [AWS Marketplace で購読する](./subscribe-on-aws-marketplace#subscribe-to-a-public-offer) セクションの手順に従って、新しいアカウントで Zilliz Cloud の購読を完了します。

    <Admonition type="info" icon="📘" title="📘 Note">

    AWS Marketplace サブスクリプションを更新する場合は、新しいサブスクリプションを Zilliz Cloud 組織にリンクするために、**Set up your account** ボタンをクリックする必要があります。

    </Admonition>

1. **Billing Overview** ページの **Payment Method** セクションで更新を確認します。Subscription ID をクリックし、サブスクリプションの **Account ID** が新しい Marketplace アカウントに更新されているか確認します。

    ![view-aws-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-aws-subscription-id.png "view-aws-subscription-id")

</Procedures>

### パブリックオファーからプライベートオファーに切り替える\{#switch-from-public-offer-to-private-offer}

マーケットプレイスのパブリックオファーからプライベートオファーに切り替えるには、Zilliz が提供するプライベートオファーを承諾します。

新しいプライベートオファーは、承諾後に以前のパブリックオファーを自動的に置き換えます。引き続き、新しいオファーを Zilliz Cloud 組織にリンクする必要があります。

詳細については、[パブリックオファーからプライベートオファーに切り替える](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer) を参照してください。 

