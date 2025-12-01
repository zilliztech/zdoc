---
title: "MFA | Cloud"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "認証は、Zilliz Cloudにサインインする際に本人確認を行うためのものです。このプロセスを強化するために、Zilliz Cloudは多要素認証（MFA）をサポートしています。 | Cloud"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - mfa
  - Knowledge base
  - 自然言語処理
  - AIチャットボット
  - コサイン距離

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MFA

認証は、Zilliz Cloudにサインインする際に本人確認を行うためのものです。このプロセスを強化するために、Zilliz Cloudは多要素認証（MFA）をサポートしています。

MFAが有効化されている場合、ログイン時に以下の2つの要素を提供する必要があります：

- アカウントパスワード

- 認証アプリ（例：Google認証システム、Microsoft認証システムなど）から生成されたTOTP（時間ベースのワンタイムパスワード）

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、アカウントセキュリティ強化のためにMFAをアップグレードしました。<strong>2025年11月25日</strong>以降、メールベースのMFAは廃止されます。以前メールベースのMFAを使用していたユーザーは、TOTP認証アプリに切り替える必要があります。</p>

</Admonition>

## 注意事項\{#considerations}

- **SSO互換性**： あなたの組織が[SSO](./single-sign-on)を有効にしている場合、MFAはアイデンティティプロバイダー（IdP）によって管理されます。この場合、IdPアカウントでMFAを設定するか、組織オーナーに相談して支援を求めてください。

- **ログイン方式の互換性**： Zilliz Cloudの内蔵MFA機能は、メールアドレスとパスワードで[Zilliz Cloudに登録](./register-with-zilliz-cloud#registration-options)したユーザーにのみ使用できます。

    - アカウントがGoogleにリンクされている場合、MFAはGoogleによって管理されます。詳しくは、[2段階認証を有効にする](https://support.google.com/accounts/answer/185839?hl=ja&ref_topic=7189195&sjid=2449417013251062800-AP)を参照してください。

    - アカウントがGitHubにリンクされている場合、MFAはGitHubによって管理されます。詳しくは、[2段階認証の設定](https://docs.github.com/ja/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication)を参照してください。

## MFAを有効化\{#enable-mfa}

以下のデモでは、自分のアカウントでMFAを有効にする方法を示しています。デモではMicrosoft認証システムを使用していますが、TOTP互換の認証アプリであればどれでも使用できます。

<Supademo id="cmi72ns5s4jwob7b4ul2t1zz5?utm_source=link" title=""  />

## MFAを無効化\{#disable-mfa}

<Admonition type="info" icon="📘" title="ノート">

<p>あなたの組織が<a href="./multi-factor-auth#enforce-mfa-for-all-organization-users">MFA強制</a>を有効にしている場合、自分のアカウントのMFAを無効にすることはできません。</p>

</Admonition>

以下のデモでは、自分のアカウントのMFAを無効にする方法を示しています。

<Supademo id="cmi7297fo4jq8b7b448ydxlhk?utm_source=link" title=""  />

## 組織ユーザー全員に対してMFAを強制\{#enforce-mfa-for-all-organization-users}

この機能を利用するには、組織オーナーである必要があります。

有効課金方法、**エンタープライズ**プロジェクト、および**専用**クラスターが必要です。

組織レベルのMFA強制が有効になっている場合：

- 組織内のすべてのユーザーが[MFAの設定](./multi-factor-auth#enable-mfa)を行い、サインインする必要があります。

- MFAをまだ有効にしていないユーザーは、次回ログイン時に設定を促されます。

- MFAの設定を完了しないユーザーは、組織にアクセスできません。

以下のデモでは、組織に対してMFAを強制する方法を示しています。

<Supademo id="cmi71danb4is0b7b4eogo3s07?utm_source=link" title=""  />

## 組織のMFA強制を無効化\{#disable-mfa-enforcement-for-organization}

この機能にアクセスするには、組織オーナーである必要があります。

組織レベルのMFA強制が無効になっている場合：

- ユーザーはMFAを設定して組織にアクセスする必要がなくなりました。

- MFAを既に有効にしているユーザーは、既存の設定を維持し、自分のアカウントの[MFAをオフにする](./multi-factor-auth#disable-mfa)ことができます。

以下のデモでは、組織のMFA強制を無効にする方法を示しています。

<Supademo id="cmi71q0gk4j6hb7b4xiywity3?utm_source=link" title=""  />

## トラブルシューティング\{#troubleshooting}

1. **認証アプリへのアクセスを失った場合はどうすればよいですか？**

    認証アプリにアクセスできないためMFAを完了できない、またはログインできない場合は、組織オーナーに連絡するか、[Zilliz Cloudサポートに連絡](http://support.zilliz.com)してください。

2. **アカウントがSSOを使用しています。MFAはどのように処理されますか？**

    組織がSSOを有効にしている場合、MFAはZilliz Cloudではなくアイデンティティプロバイダー（IdP）によって管理されます。IdPアカウントでMFAを設定するか、組織オーナーに相談してください。

3. **なぜMFAを無効にできないのですか？**

    組織がMFA強制を有効にしている場合、自分のアカウントのMFAをオフにすることはできません。

4. **組織オーナーですが、MFA強制後に一部のユーザーがロックアウトされています。どうすればよいですか？**

    それらのユーザーに、ログイン時に表示されるプロンプトに従ってMFAの設定を完了するように指示してください。それでも組織にアクセスできない場合は、[Zilliz Cloudサポートに連絡](http://support.zilliz.com)してください。