---
title: "Marketplace サブスクリプション | Cloud"
slug: /marketplace-subscription
sidebar_key: marketplace-subscription
sidebar_label: "Marketplace サブスクリプション"
beta: FALSE
notebook: FALSE
description: "サポートされているクラウド Marketplace を通じて Zilliz Cloud をサブスクライブし、既存のクラウド請求アカウントで Zilliz Cloud の料金を受け取ることができます。 | Cloud"
type: origin
token: OFjswbvuoit64pk5eGqc9Yx3nGg
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - marketplace subscription
  - AWS
  - Google Cloud
  - Microsoft
  - Marketplace

---

import Admonition from '@theme/Admonition';


# Marketplace サブスクリプション

サポートされているクラウド Marketplace を通じて Zilliz Cloud をサブスクライブし、既存のクラウド請求アカウントで Zilliz Cloud の料金を受け取ることができます。

<Admonition type="info" icon="📘" title="Note">

支払い方法とサブスクリプションを管理するには、**Organization Owner** または **Organization Billing Admin** である必要があります。

</Admonition>

Zilliz Cloud は、次の Marketplace を通じたサブスクリプションをサポートしています。

- AWS Marketplace

- Google Cloud Marketplace

- Microsoft Marketplace

## サブスクリプションオプション\{#subscription-options}

各 Marketplace では、複数のサブスクリプションオプションがサポートされる場合があります。

- Marketplace Free trial

- Marketplace Public offer

- Marketplace Private offer

次の表では、サブスクリプションオプションを比較します。

<table>
   <tr>
     <th><p><strong>サブスクリプションオプション</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>適した用途</strong></p></th>
     <th><p><strong>商用条件</strong></p></th>
     <th><p><strong>提供状況</strong></p></th>
   </tr>
   <tr>
     <td><p>Marketplace Free Trial</p></td>
     <td><p>有料サブスクリプションへ移行する前に、クラウド Marketplace 経由で Zilliz Cloud を評価できるトライアルサブスクリプションです。</p></td>
     <td><p>初期評価と短期テスト。</p></td>
     <td><p>30 日間の無料トライアル。無料トライアル終了後は、有料サブスクリプションへ<a href="./subscribe-on-aws-marketplace-free-trial#upgrade-to-paid-subscription">アップグレード</a>する必要があります。</p></td>
     <td><p><strong>AWS</strong> Marketplace 経由の Zilliz Cloud <strong>SaaS</strong> デプロイメントでのみ利用できます。</p></td>
   </tr>
   <tr>
     <td><p>Marketplace Public Offer</p></td>
     <td><p>クラウド Marketplace で利用できる標準の Zilliz Cloud リスティングです。</p></td>
     <td><p>標準価格と標準条件でのセルフサービスサブスクリプション。</p></td>
     <td><p>Marketplace のリスティングページに表示される公開価格、契約条件、請求ルールを使用します。</p></td>
     <td><p><strong>AWS、Google Cloud、Microsoft</strong> Marketplace 経由の Zilliz Cloud <strong>SaaS</strong> デプロイメントでのみ利用できます。</p></td>
   </tr>
   <tr>
     <td><p>Marketplace Private Offer</p></td>
     <td><p>Zilliz が組織向けに作成するカスタムオファーです。</p></td>
     <td><p>エンタープライズ調達、割引、コミット済み利用額、カスタム条件、BYOC 購入。</p></td>
     <td><p>交渉済み価格、カスタム契約期間、支払いスケジュール、その他の商用条件を含めることができます。</p></td>
     <td><p><strong>AWS、Google Cloud、Microsoft</strong> Marketplace 経由の Zilliz Cloud <strong>SaaS</strong> および <strong>BYOC</strong> デプロイメントで利用できます。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="**Note**">

AWS Marketplace Free Trial は AWS Marketplace で開始および管理されます。トライアル後にアップグレードすると、それ以降の料金は AWS Marketplace 経由で請求されます。このオプションは、AWS Marketplace 経由で調達と請求を行いたいチームに適しています。

Zilliz Cloud Free Trial は Zilliz Cloud コンソールから直接開始され、Zilliz Cloud 内で管理されます。トライアル後は、サポートされている[支払い方法](./set-up-payment-method)を追加できます。このオプションは、外部請求を設定する前に Zilliz Cloud を直接試したいユーザーに適しています。

</Admonition>

## 考慮事項\{#considerations}

Marketplace サブスクリプションは支払い方法にすぎません。プロジェクト、クラスタ、関連リソースを作成するクラウドプロバイダーを決定するものではありません。たとえば、AWS Marketplace 経由でサブスクライブした後でも、選択したクラウドプロバイダーとリージョンがサポートされていれば、AWS、Google Cloud、または Azure 上に Zilliz Cloud プロジェクトとクラスタを作成できます。

import DocCardList from '@theme/DocCardList';

<DocCardList />
