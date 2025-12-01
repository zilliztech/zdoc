---
title: "コンソールIP許可リストの設定 | Cloud"
slug: /setup-console-ip-allowlist
sidebar_label: "コンソールIP許可リストの設定"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "デフォルトでは、組織のWebコンソールは任意のIPアドレスからアクセスできます。アクセスを制限してセキュリティを強化するために、コンソールIP許可リストを設定して、オフィスネットワークのIPなどの特定のアドレスからのみWebコンソールにアクセスできるようにします。 | Cloud"
type: origin
token: E1BCwXVouiDrtpkWp5ecvdXHnAb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - ネットワーク
  - セキュリティ
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# コンソールIP許可リストの設定

デフォルトでは、組織のWebコンソールは任意のIPアドレスからアクセスできます。アクセスを制限してセキュリティを強化するために、コンソールIP許可リストを設定して、オフィスネットワークのIPなどの特定のアドレスからのみWebコンソールにアクセスできるようにします。

コンソールIP許可リストは、組織Webコンソールにのみ適用されます。プロジェクトクラスターへのアクセスを制御するものではありません。クラスターへのアクセスを制限するには、「[クラスターIP許可リストの設定](./setup-whitelist)」を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は、<strong>エンタープライズ</strong>プロジェクト内の<strong>専用</strong>クラスターでのみ利用可能です。</p>

</Admonition>

## 制限事項\{#limits}

- Zilliz Cloud組織には、少なくとも1つの<strong>実行中の専用</strong>クラスターが<strong>エンタープライズ</strong>プロジェクトにある必要があります。

- 組織には有効な支払い方法が必要です。

- 組織オーナーである必要があります。

- コンソール許可リストに最大100個のIPを追加できます。

## IPアドレスの追加\{#add-ip-address}

IPv4アドレス（例：`192.168.0.0`）またはCIDRブロック（`192.168.0.0/24`）を許可リストに追加できます。

ロックアウトを防ぐために、現在のIPと頻繁に使用するIPを追加することをお勧めします。

<Admonition type="info" icon="📘" title="ノート">

<p><code>0.0.0.0/0</code>を使用すると、任意のIPからのアクセスが許可されます。</p>
<p>コンソールIP許可リストへの更新は、30秒以内に反映されます。</p>

</Admonition>

以下のデモは、許可リストにIPアドレスを追加する方法を示しています。

<Supademo id="cmi79l9ih4slqb7b4yi1x32r1?utm_source=link" title=""  />

## IPアドレスの表示\{#view-ip-address}

許可リストを設定した後、いつでもIPを確認できます。

以下のデモは、許可リストのIPアドレスを表示する方法を示しています。

<Supademo id="cmi79trxa4tbsb7b44fnxlgik?utm_source=link" title=""  />

## IPアドレスの削除\{#delete-ip-address}

IPまたはCIDRエントリを削除して、そのソースからのコンソールアクセスを拒否できます。すべてのエントリを削除すると、コンソールは任意のIPからアクセスできるようになります。

<Admonition type="info" icon="📘" title="ノート">

<p>コンソールIP許可リストへの更新は、30秒以内に反映されます。</p>

</Admonition>

以下のデモは、許可リストからIPアドレスを削除する方法を示しています。

<Supademo id="cmi79zr2500s6z20jewbtd5xb?utm_source=link" title=""  />

## よくある質問\{#faqs}

1. **ロックアウトされた場合にできること**

    ロックアウトされると、以下のような画面が表示されます。

    ![YGKLbTmW7oYJkIxuyx2cf6cvnwh](/img/ygklbtmw7oyjkixuyx2cf6cvnwh.png "YGKLbTmW7oYJkIxuyx2cf6cvnwh")

    以下の回復オプションを試してください：

    - 許可リストにあるIPのネットワーク（例：オフィスVPN）から接続します。

    - アクセス権を保持している組織オーナーに依頼して、新しいIPを追加してもらいます。

    - 誰もコンソールにアクセスできない場合は、[サポートに連絡](http://support.zilliz.com)して支援を受けてください。

1. **コンソールIP許可リストを更新したときに、現在ログインしているユーザーにどのような影響がありますか？**

    更新は新しいサインインに適用されます。既存のセッションは、有効期限が切れるかユーザーがログアウトするまで通常は継続します。許可リストを即座に適用するには、組織ユーザーにログアウトして再度ログインするように依頼してください。

1. **SSOまたはMFAはコンソールIP許可リストをバイパスしますか？**

    いいえ。[SSO](./single-sign-on)、[MFA](./multi-factor-auth)、および組織コンソールIP許可リストは別々の制御です。

1. **組織コンソールIP許可リストはクラスターアクセスに影響しますか？**

    いいえ。コンソールIP許可リストはWebコンソールへのアクセスのみを制限します。クラスターへのアクセスを制限するには、[クラスターIP許可リスト](./setup-whitelist)を設定してください。

1. **動的IPを使用している場合どうなりますか？**

    インターネットサービスプロバイダ（ISP）がアドレスをローテーションする場合は、範囲をカバーする小さなCIDR（例：`/29`または`/28`）を許可することを検討してください。