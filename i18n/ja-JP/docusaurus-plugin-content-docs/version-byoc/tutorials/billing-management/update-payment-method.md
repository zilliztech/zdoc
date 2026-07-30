---
title: "支払い方法の更新 | BYOC"
slug: /update-payment-method
sidebar_key: update-payment-method
sidebar_label: "支払い方法の更新"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "組織で期限切れのカードを置き換える、請求をクラウド Marketplace に移行する、Marketplace アカウントを切り替える、または Marketplace 請求からクレジットカード請求に戻す必要がある場合は、支払い方法を更新できます。 | BYOC"
type: origin
token: TfzMwdLsWibd0UkGpGAcLhuInvb
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - cloud
  - 支払い
  - 請求
  - 更新

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 支払い方法の更新

組織で期限切れのカードを置き換える、請求をクラウド Marketplace に移行する、Marketplace アカウントを切り替える、または Marketplace 請求からクレジットカード請求に戻す必要がある場合は、支払い方法を更新できます。

<Admonition type="info" icon="📘" title="Note">

支払い方法を管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

## サポートされる支払い方法の変更\{#supported-payment-method-changes}

Zilliz Cloud は、次の支払い方法の変更をサポートしています。

<table>
   <tr>
     <th><p><strong>変更元</strong></p></th>
     <th><p><strong>変更先</strong></p></th>
     <th><p><strong>更新方法</strong></p></th>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>クレジットカード</p></td>
     <td><p>Zilliz Cloud コンソールで追加済みのクレジットカードを置き換えます。</p></td>
   </tr>
   <tr>
     <td><p>クレジットカード</p></td>
     <td><p>Marketplace subscription</p></td>
     <td><p>対象の Marketplace から Zilliz Cloud をサブスクライブし、そのサブスクリプションを Zilliz Cloud 組織にリンクします。</p><p>サブスクリプションがリンクされると、支払い方法は自動的に更新されます。Marketplace subscription がクレジットカード情報を自動的に置き換えます。</p></td>
   </tr>
   <tr>
     <td><p>Marketplace subscription</p></td>
     <td><p>クレジットカード</p></td>
     <td><p>現在の Marketplace subscription をキャンセルしてから、Zilliz Cloud コンソールでクレジットカードを追加します。</p></td>
   </tr>
   <tr>
     <td><p>Marketplace subscription</p></td>
     <td><p>Marketplace subscription</p></td>
     <td><p>現在の Marketplace subscription をキャンセルし、新しい Marketplace アカウントからサブスクライブして、新しいサブスクリプションを Zilliz Cloud 組織にリンクします。</p></td>
   </tr>
</table>

## クレジットカードを置き換える\{#replace-a-credit-card}

ステップごとの手順については、[クレジットカード](./subscribe-by-adding-credit-card#replace-a-credit-card)を参照してください。

## クレジットカードから Marketplace subscription に切り替える\{#switch-from-credit-card-to-marketplace-subscription}

クレジットカード請求から Marketplace 請求に切り替えるには、次の手順に従います。

<Procedures>

1. クラウド Marketplace から Zilliz Cloud をサブスクライブします。

    - [AWS Marketplace](./subscribe-on-aws-marketplace)

    - [Google Cloud Marketplace](./subscribe-on-gcp-marketplace)

    - [Microsoft Marketplace](./subscribe-on-azure-marketplace)

1. 更新を確認します。

    Marketplace subscription が成功すると、支払い方法は自動的に更新されます。クレジットカードを手動で削除する必要はありません。

    **Billing** ページで更新を確認できます。

</Procedures>

## Marketplace subscription からクレジットカードに切り替える\{#switch-from-marketplace-subscription-to-credit-card}

Marketplace 請求からクレジットカード請求に切り替えるには、次の手順に従います。

<Procedures>

1. サブスクライブしたクラウド Marketplace で現在のサブスクリプションをキャンセルします。

1. Zilliz Cloud コンソールで、**Billing** に移動します。

1. **Payment Method** セクションで[クレジットカードを追加](./subscribe-by-adding-credit-card#add-a-credit-card)します。

</Procedures>

追加が成功すると、組織はそのクレジットカードを支払い方法として使用します。

## Marketplace subscription 間で切り替える\{#switch-between-marketplace-subscriptions}

請求に使用する Marketplace アカウントを変更する、AWS Marketplace の無料トライアルをアップグレードする、またはパブリックオファーからプライベートオファーへ移行する必要がある場合は、Marketplace subscription 間で切り替えることができます。

必要な手順は、変更の種類によって異なります。

<table>
   <tr>
     <th><p><strong>シナリオ</strong></p></th>
     <th><p><strong>対応内容</strong></p></th>
   </tr>
   <tr>
     <td><p>請求に使用する Marketplace アカウントを変更する</p></td>
     <td><p>現在の Marketplace subscription をキャンセルし、新しい Marketplace アカウントで再度サブスクライブして、新しいサブスクリプションを Zilliz Cloud 組織にリンクします。</p></td>
   </tr>
   <tr>
     <td><p>AWS Marketplace の無料トライアルをアップグレードする</p></td>
     <td><p>AWS Marketplace のオファーページからアップグレードまたはサブスクライブしてから、有料サブスクリプションを Zilliz Cloud 組織にリンクします。</p></td>
   </tr>
   <tr>
     <td><p>パブリックオファーからプライベートオファーに切り替える</p></td>
     <td><p>プライベートオファーを承諾します。プライベートオファーは以前のパブリックオファーを置き換えます。引き続き、新しいオファーを Zilliz Cloud 組織にリンクする必要があります。</p></td>
   </tr>
</table>

### Marketplace アカウントを変更する\{#change-marketplace-account}

次の例は、請求に使用する AWS Marketplace アカウントを変更する方法を示しています。同じプロセスは Google Cloud Marketplace と Microsoft Marketplace にも適用されます。

<Admonition type="info" icon="📘" title="Note">

サービス中断を避けるため、1 時間以内に操作を完了することをお勧めします。

</Admonition>

<Procedures>

1. サブスクリプションに使用していた元の AWS アカウントで AWS Marketplace にサインインします。

1. Zilliz Cloud サブスクリプションをキャンセルします。詳細については、[Cancel your product subscription](https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html#cancel-saas-subscription) を参照してください。

    <Admonition type="info" icon="📘" title="Note">

    サブスクリプションをキャンセルしても、Zilliz Cloud のデータは削除されません。

    </Admonition>

    AWS Marketplace がキャンセル処理を完了するまで数分かかります。

1. 元の AWS アカウントからサインアウトします。

1. サブスクリプションに使用したい別の AWS アカウントで AWS Marketplace にサインインします。

1. [AWS Marketplace でサブスクライブする](./subscribe-on-aws-marketplace#subscribe-to-a-public-offer)セクションの手順に従い、新しいアカウントで Zilliz Cloud のサブスクリプションを完了します。

    <Admonition type="info" icon="📘" title="Note">

    AWS Marketplace subscription を更新する場合は、**Set up your account** ボタンをクリックして、新しいサブスクリプションを Zilliz Cloud 組織にリンクする必要があります。

    </Admonition>

1. **Billing Overview** ページの **Payment Method** セクションで更新を確認します。Subscription ID をクリックし、サブスクリプションの **Account ID** が新しい Marketplace アカウントに更新されているかを確認します。

    ![view-aws-subscription-id](https://zdoc-images.s3.us-west-2.amazonaws.com/view-aws-subscription-id.png "view-aws-subscription-id")

</Procedures>

### パブリックオファーからプライベートオファーに切り替える\{#switch-from-public-offer-to-private-offer}

Marketplace のパブリックオファーからプライベートオファーに切り替えるには、Zilliz から提供されたプライベートオファーを承諾します。

新しいプライベートオファーは、承諾後に以前のパブリックオファーを自動的に置き換えます。引き続き、新しいオファーを Zilliz Cloud 組織にリンクする必要があります。

詳細については、[パブリックオファーからプライベートオファーに切り替える](./subscribe-on-aws-marketplace-private-offer#switch-from-a-public-offer-to-a-private-offer)を参照してください。
