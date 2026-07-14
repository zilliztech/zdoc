---
title: "コンソール IP 許可リストを設定する | BYOC"
slug: /setup-console-ip-allowlist
sidebar_label: "コンソール IP 許可リストを設定する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織の Web コンソールには任意の IP アドレスからアクセスできます。アクセスを制限してセキュリティを強化するには、コンソール IP 許可リストを設定し、オフィス ネットワークの IP など、指定したアドレスからのみユーザーが Web コンソールにアクセスできるようにします。 | BYOC"
type: origin
token: E1BCwXVouiDrtpkWp5ecvdXHnAb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# コンソール IP 許可リストを設定する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイメントでのみ利用できます。

</FeatureNote>

デフォルトでは、組織の Web コンソールには任意の IP アドレスからアクセスできます。アクセスを制限してセキュリティを強化するには、コンソール IP 許可リストを設定し、オフィス ネットワークの IP など、指定したアドレスからのみユーザーが Web コンソールにアクセスできるようにします。

コンソール IP 許可リストは、組織の Web コンソールにのみ適用されます。プロジェクトクラスタへのアクセスは制御しません。

## 制限\{#limits}

- あなたが Organization Owner であること。

- コンソール許可リストに追加できる IP は最大 100 件までです。

## IP アドレスを追加する\{#add-ip-address}

許可リストには、IPv4 アドレス（例: `192.168.0.0`）または CIDR ブロック（`192.168.0.0/24`）を追加できます。 

ロックアウトを避けるために、現在の IP とよく使用する IP を追加しておくことを推奨します。 

<Admonition type="info" icon="📘" title="📘 メモ">

`0.0.0.0/0` は任意の IP からのアクセスを許可します。

コンソール IP 許可リストへの更新は 30 秒以内に反映されます。

</Admonition>

次のデモでは、許可リストに IP アドレスを追加する方法を示します。 

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## IP アドレスを表示する\{#view-ip-address}

許可リストを設定した後は、いつでも IP を確認できます。

次のデモでは、許可リスト内の IP アドレスを表示する方法を示します。

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## IP アドレスを削除する\{#delete-ip-address}

IP または CIDR エントリを削除して、その送信元からのコンソールアクセスを拒否できます。すべてのエントリを削除すると、コンソールは任意の IP からアクセス可能になります。

<Admonition type="info" icon="📘" title="📘 メモ">

コンソール IP 許可リストへの更新は 30 秒以内に反映されます。

</Admonition>

次のデモでは、許可リストから IP アドレスを削除する方法を示します。

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## FAQ\{#faqs}

1. **ロックアウトされた場合はどうすればよいですか？**

    ロックアウトされると、以下の画面が表示されます。

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](https://zdoc-images.s3.us-west-2.amazonaws.com/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    次の回復オプションを試してください。

    - 許可リストに含まれている IP のネットワークから接続します（例: オフィス VPN）。

    - まだアクセスできる Organization Owner に、新しい IP を追加してもらいます。

    - どの Organization Owner もコンソールにアクセスできない場合は、支援を受けるために [サポートに問い合わせてください](http://support.zilliz.com)。

1. **コンソール IP 許可リストを更新すると、現在サインインしているユーザーには何が起こりますか？**

    更新は新しいサインインに適用されます。既存のセッションは通常、有効期限が切れるか、ユーザーがサインアウトするまで継続します。許可リストを直ちに適用するには、組織ユーザーにログアウトしてから再度ログインするよう依頼してください。

1. **SSO または MFA はコンソール IP 許可リストをバイパスしますか？**

    いいえ。[SSO](./single-sign-on)、[MFA](./multi-factor-auth)、および組織コンソールの IP 許可リストは、それぞれ独立した制御です。 

1. **組織コンソールの IP 許可リストはクラスタアクセスに影響しますか？**

    いいえ。コンソール IP 許可リストは、Web コンソールへのアクセスのみを制限します。 

1. **動的 IP を使用している場合はどうなりますか？**

    インターネット サービス プロバイダー（ISP）がアドレスをローテーションする場合は、対象範囲をカバーする小さな CIDR（例: `/29` または `/28`）を許可することを検討してください。

