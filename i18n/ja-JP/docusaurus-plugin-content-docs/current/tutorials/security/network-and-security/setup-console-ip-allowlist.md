---
title: "コンソール IP アドレス許可リストの設定 | Cloud"
slug: /setup-console-ip-allowlist
sidebar_key: setup-console-ip-allowlist
sidebar_label: "コンソール IP アドレス許可リストの設定"
beta: FALSE
notebook: FALSE
description: "デフォルトでは、組織の Web コンソールはあらゆる IP アドレスからアクセス可能です。アクセスを制限してセキュリティを強化するには、コンソール IP アドレス許可リストを設定し、オフィスネットワークの IP アドレスなど、指定されたアドレスからのみ Web コンソールにアクセスできるようにします。| Cloud"
type: origin
token: E1BCwXVouiDrtpkWp5ecvdXHnAb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - ネットワーク
  - セキュリティ

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# コンソール IP アドレスの許可リストの設定

デフォルトでは、組織の Web コンソールは任意の IPアドレス からアクセス可能です。アクセスを制限しセキュリティを強化するには、コンソール IP 許可リストを設定して、オフィスネットワークの IP など指定されたアドレスからのみ Web コンソールにアクセスできるようにします。

コンソール IP 許可リストは組織の Web コンソールにのみ適用されます。プロジェクトクラスターへのアクセス制御は行いません。クラスターへのアクセスを制限するには、[クラスター IP 許可リストの設定](./setup-whitelist) をご覧ください。

<Admonition type="info" icon="📘" title="Notes">

<p>この機能は、<strong>Enterprise</strong> プロジェクト内の <strong>Dedicated</strong> クラスターでのみ利用可能です。</p>

</Admonition>

## 制限\{#limits}

- Zilliz Cloud 組織には、**Enterprise** プロジェクト内に少なくとも 1 つの **Dedicatedの実行** クラスターが存在している必要があります。

- 組織に有効な支払い方法が設定されている必要があります。

- あなたは 組織オーナー である必要があります。

- コンソール許可リストに追加できる IP アドレスは最大 100 個までです。

## IP アドレスの追加\{#add-ip-address}

IPv4 アドレス（例：`192.168.0.0`）または CIDR ブロック（`192.168.0.0/24`）を許可リストに追加できます。

ロックアウトを防ぐため、現在の IP と頻繁に使用する IP を追加することを推奨します。

<Admonition type="info" icon="📘" title="Notes">

<p><code>0.0.0.0/0</code> は任意の IP からのアクセスを許可します。</p>
<p>コンソール IP 許可リストの変更は 30 秒以内に反映されます。</p>

</Admonition>

以下のデモでは、許可リストに IP アドレスを追加する方法を示しています。

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## IP アドレスの確認\{#view-ip-address}

許可リストを設定した後、いつでも IP を確認できます。

以下のデモでは、許可リスト内の IP アドレスを確認する方法を示しています。

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## IP アドレスの削除\{#delete-ip-address}

IP または CIDR エントリを削除して、そのソースからのコンソールアクセスを拒否できます。すべてのエントリを削除すると、コンソールは任意の IP からアクセス可能になります。

<Admonition type="info" icon="📘" title="Notes">

<p>コンソール IP 許可リストの変更は 30 秒以内に反映されます。</p>

</Admonition>

以下のデモでは、許可リストから IP アドレスを削除する方法を示しています。

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## よくある質問\{#faqs}

1. **ロックアウトされた場合どうすればよいですか？**

    ロックアウトされると、以下の画面が表示されます。

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](https://zdoc-images.s3.us-west-2.amazonaws.com/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    以下の復旧オプションをお試しください：

    - 許可リストに含まれる IP を持つネットワーク（例：オフィスの VPN）から接続する。

    - まだアクセス可能な 組織オーナー に依頼して、新しい IP を追加してもらう。

    - オーナー誰もコンソールにアクセスできない場合は、[サポートへ連絡](http://support.zilliz.com) してください。

1. **コンソール IP 許可リストを更新した場合、現在ログイン中のユーザーにはどのような影響がありますか？**

    更新は新しいサインインにのみ適用されます。既存のセッションは通常、有効期限が切れるかユーザーがログアウトするまで継続します。許可リストを直ちに強制適用するには、組織のユーザーにログアウトしてから再度ログインするよう依頼してください。

1. **SSO または MFA はコンソール IP 許可リストをバイパスしますか？**

    いいえ。[SSO](./single-sign-on)、[MFA](./multi-factor-auth)、および組織コンソール IP 許可リストは個別の制御機構です。

1. **組織コンソール IP 許可リストはクラスターアクセスに影響しますか？**

    いいえ。コンソール IP 許可リストは Web コンソールへのアクセスのみを制限します。クラスターへのアクセスを制限するには、[クラスター IP 許可リスト](./setup-whitelist) を設定してください。

1. **動的 IP を使用している場合はどうすればよいですか？**

    インターネットサービスプロバイダー（ISP）がアドレスをローテーションさせる場合、範囲をカバーする小さな CIDR（例：`/29` または `/28`）を許可することを検討してください。

