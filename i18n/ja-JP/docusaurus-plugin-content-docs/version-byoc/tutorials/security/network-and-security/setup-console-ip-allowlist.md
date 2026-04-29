---
title: "コンソール IP ホワイトリストの設定 | BYOC"
slug: /setup-console-ip-allowlist
sidebar_key: setup-console-ip-allowlist
sidebar_label: "コンソール IP ホワイトリストの設定"
beta: FALSE
notebook: FALSE
description: "デフォルトでは、組織の Web コンソールは任意の IP アドレスからアクセス可能です。アクセスを制限してセキュリティを強化するには、コンソール IP ホワイトリストを設定し、オフィスネットワークの IP など指定されたアドレスからのみ Web コンソールにアクセスできるようにします。| BYOC"
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

# コンソール IP 許可リストの設定

デフォルトでは、組織の Web コンソールは任意の IP アドレスからアクセス可能です。アクセスを制限しセキュリティを強化するには、コンソール IP 許可リストを設定して、オフィスネットワークの IP など指定されたアドレスからのみ Web コンソールにアクセスできるようにします。

コンソール IP 許可リストは組織 Web コンソールにのみ適用されます。プロジェクトクラスターへのアクセスは制御しません。

## 制限s\{#limits}

- あなたは組織オーナーです。

- コンソール許可リストに追加できる IP は最大 100 個までです。

## Add IPアドレス\{#add-ip-address}

許可リストには、IPv4 アドレス（例：`192.168.0.0`）または CIDR ブロック（`192.168.0.0/24`）を追加できます。

ロックアウトを防ぐため、現在の IP と頻繁に使用する IP を追加することを推奨します。

<Admonition type="info" icon="📘" title="Notes">

<p><code>0.0.0.0/0</code> は任意の IP からのアクセスを許可します。</p>
<p>コンソール IP 許可リストの更新は 30 秒以内に有効になります。</p>

</Admonition>

以下のデモでは、許可リストに IP アドレスを追加する方法を示します。

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## View IPアドレス\{#view-ip-address}

許可リストを設定した後、いつでも IP を確認できます。

以下のデモでは、許可リスト内の IP アドレスを表示する方法を示します。

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## Delete IPアドレス\{#delete-ip-address}

IP または CIDR エントリを削除して、そのソースからのコンソールアクセスを拒否できます。すべてのエントリを削除すると、コンソールは任意の IP からアクセス可能になります。

<Admonition type="info" icon="📘" title="Notes">

<p>コンソール IP 許可リストの更新は 30 秒以内に有効になります。</p>

</Admonition>

以下のデモでは、許可リストから IP アドレスを削除する方法を示します。

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## FAQs\{#faqs}

1. **ロックアウトされた場合どうすればよいですか？**

    ロックアウトされると、以下の画面が表示されます。

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](https://zdoc-images.s3.us-west-2.amazonaws.com/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    以下の復旧オプションをお試しください：

    - 許可リストに含まれる IP のネットワーク（例：オフィス VPN）から接続する。

    - まだアクセス可能な組織オーナーに依頼し、新しい IP を追加してもらう。

    - オーナー誰もコンソールにアクセスできない場合は、[サポートにお問い合わせ](http://support.zilliz.com) ください。

1. **コンソール IP 許可リストを更新すると、現在ログイン中のユーザーはどうなりますか？**

    更新は新しいログインに適用されます。既存のセッションは、通常、有効期限が切れるかユーザーがログアウトするまで継続します。許可リストを直ちに強制するには、組織のユーザーにログアウトして再ログインするよう依頼してください。

1. **SSO または MFA はコンソール IP 許可リストをバイパスしますか？**

    いいえ。[SSO](./single-sign-on)、[MFA](./multi-factor-auth)、および組織コンソール IP 許可リストは個別の制御機能です。

1. **組織コンソール IP 許可リストはクラスターアクセスに影響しますか？**

    いいえ。コンソール IP 許可リストは Web コンソールへのアクセスのみを制限します。

1. **動的 IP を使用している場合はどうすればよいですか？**

    インターネットサービスプロバイダー（ISP）がアドレスをローテーションさせる場合、範囲をカバーする小さな CIDR（例：`/29` または `/28`）を許可することを検討してください。

