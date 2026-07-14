---
title: "Console IP Allowlist を設定する | Cloud"
slug: /setup-console-ip-allowlist
sidebar_label: "Console IP Allowlist を設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織の web コンソールには任意の IP アドレスからアクセスできます。アクセスを制限してセキュリティを強化するには、console IP allowlist を設定し、オフィスネットワークの IP など、指定したアドレスからのみ web コンソールにアクセスできるようにします。 | Cloud"
type: origin
token: E1BCwXVouiDrtpkWp5ecvdXHnAb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Console IP Allowlist を設定する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上、および BYOC デプロイメントでのみ使用できます。

</FeatureNote>

デフォルトでは、組織の web コンソールには任意の IP アドレスからアクセスできます。アクセスを制限してセキュリティを強化するには、console IP allowlist を設定し、オフィスネットワークの IP など、指定したアドレスからのみ web コンソールにアクセスできるようにします。

console IP allowlist は、組織の web コンソールにのみ適用されます。project cluster へのアクセスは制御しません。cluster へのアクセスを制限するには、[Cluster IP Allowlist を設定する](./setup-whitelist) を参照してください。

## 制限事項\{#limits}

- Zilliz Cloud 組織には、**Enterprise** project 内に少なくとも 1 つの**稼働中の Dedicated** cluster が必要です。

- 組織には有効な支払い方法が必要です。

- あなたが Organization Owner である必要があります。

- console allowlist に追加できる IP は最大 100 個までです。

## IP アドレスを追加する\{#add-ip-address}

allowlist には、IPv4 アドレス（例: `192.168.0.0`）または CIDR ブロック（`192.168.0.0/24`）を追加できます。 

ロックアウトを避けるため、現在の IP と頻繁に使用する IP を追加することを推奨します。 

<Admonition type="info" icon="📘" title="📘 注意">

`0.0.0.0/0` は任意の IP からのアクセスを許可します。

console IP allowlist への更新は 30 秒以内に反映されます。

</Admonition>

以下のデモは、allowlist に IP アドレスを追加する方法を示しています。 

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## IP アドレスを表示する\{#view-ip-address}

allowlist を設定した後は、いつでも IP を確認できます。

以下のデモは、allowlist 内の IP アドレスを表示する方法を示しています。

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## IP アドレスを削除する\{#delete-ip-address}

IP または CIDR エントリを削除して、その送信元からのコンソールアクセスを拒否できます。すべてのエントリを削除すると、コンソールは任意の IP からアクセス可能になります。

<Admonition type="info" icon="📘" title="📘 注意">

console IP allowlist への更新は 30 秒以内に反映されます。

</Admonition>

以下のデモは、allowlist から IP アドレスを削除する方法を示しています。

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## FAQ\{#faqs}

1. **ロックアウトされた場合はどうすればよいですか？**

    ロックアウトされると、以下の画面が表示されます。

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](https://zdoc-images.s3.us-west-2.amazonaws.com/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    次の復旧方法をお試しください。

    - allowlist に含まれている IP のネットワークから接続する（例: オフィス VPN）。

    - まだアクセスできる Organization Owner に依頼して、新しい IP を追加してもらう。

    - どの owner もコンソールにアクセスできない場合は、サポートを受けるために [support に連絡](http://support.zilliz.com) してください。

1. **console IP allowlist を更新すると、現在サインインしているユーザーにはどう影響しますか？**

    更新は新しいサインインに適用されます。既存のセッションは通常、有効期限が切れるかユーザーがサインアウトするまで継続します。allowlist をすぐに適用するには、組織のユーザーにログアウトして再度ログインするよう依頼してください。

1. **SSO または MFA は console IP allowlist をバイパスしますか？**

    いいえ。[SSO](./single-sign-on)、[MFA](./multi-factor-auth)、および組織の console IP allowlist は、それぞれ独立した制御です。 

1. **組織の console IP allowlist は cluster へのアクセスに影響しますか？**

    いいえ。console IP allowlist は web コンソールへのアクセスのみを制限します。cluster へのアクセスを制限するには、[cluster IP allowlist](./setup-whitelist) を設定してください。

1. **動的 IP を使用している場合はどうなりますか？**

    インターネットサービスプロバイダー（ISP）がアドレスをローテーションする場合は、その範囲をカバーする小さな CIDR（例: `/29` または `/28`）の許可を検討してください。

