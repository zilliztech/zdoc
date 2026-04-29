---
title: "MFA | BYOC"
slug: /multi-factor-auth
sidebar_key: multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
notebook: FALSE
description: "認証は、Zilliz Cloud にサインインする際の本人確認を行います。このプロセスを強化するため、Zilliz Cloud は多要素認証（MFA）をサポートしています。| BYOC"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - mfa

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MFA

認証は、Zilliz Cloud にサインインする際の本人確認を行います。このプロセスを強化するため、Zilliz Cloud は多要素認証 (MFA) をサポートしています。

MFA が有効になっている場合、ログイン時に以下の 2 つの要素を提供する必要があります。

- アカウントのパスワード

- 認証アプリ（例：Google Authenticator、Microsoft Authenticator など）からの TOTP（時間ベースのワンタイムパスワード）

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud は、アカウントセキュリティを強化するために MFA をアップグレードしました。<strong>2025 年 11 月 25 日</strong>より、メールベースの MFA は非推奨となります。以前にメールベースの MFA を使用していたユーザーは、TOTP 認証アプリに切り替える必要があります。</p>

</Admonition>

## 考慮事項\{#considerations}

- **SSO 互換性**: 組織で [SSO](./single-sign-on) が有効になっている場合、MFA はアイデンティティプロバイダー (IdP) によって管理されます。この場合、IdP アカウントで MFA を構成するか、組織オーナーに連絡してサポートを受けてください。

- **ログイン方法の互換性**: Zilliz Cloud 組み込みの MFA 機能は、メールアドレスとパスワードで [登録](./register-with-zilliz-cloud#registration-options) したユーザーのみ利用可能です。

    - アカウントが Google にリンクされている場合、MFA は Google によって制御されます。詳細については、[2 段階認証プロセスをオンにする](https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP) をご覧ください。

    - アカウントが GitHub にリンクされている場合、MFA は GitHub によって制御されます。詳細については、[2 要素認証の構成](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) をご覧ください。

## MFA の有効化\{#enable-mfa}

次のデモでは、ご自身のアカウントで MFA を有効にする方法を示します。このデモでは Microsoft Authenticator を例として使用していますが、TOTP 対応の任意の認証アプリを使用できます。

<Supademo id="cmi72ns5s4jwob7b4ul2t1zz5?utm_source=link" title=""  />

## MFA の無効化\{#disable-mfa}

<Admonition type="info" icon="📘" title="Notes">

<p>組織で <a href="./multi-factor-auth#enforce-mfa-for-all-organization-users">MFA の強制</a> が有効になっている場合、アカウントの MFA を無効にすることはできません。</p>

</Admonition>

次のデモでは、ご自身のアカウントで MFA を無効にする方法を示します。

<Supademo id="cmi7297fo4jq8b7b448ydxlhk?utm_source=link" title=""  />

## 組織の全ユーザーに対する MFA の強制\{#enforce-mfa-for-all-organization-users}

<Admonition type="info" icon="📘" title="Notes">

<p>この機能にアクセスするには、組織オーナーである必要があります。</p>
<p>この機能を使用するには、有効な支払い方法、<strong>Enterprise</strong> プロジェクト、および <strong>Dedicated</strong> クラスターが必要です。</p>

</Admonition>

組織レベルの MFA 強制が有効になると：

- 組織内のすべてのユーザーは、サインインするために MFA を [設定](./multi-factor-auth#enable-mfa) する必要があります。

- まだ MFA を有効にしていないユーザーは、次回ログイン時に設定を促されます。

- MFA の設定を完了しないユーザーは、組織にアクセスできなくなります。

次のデモでは、組織に対して MFA を強制する方法を示します。

<Supademo id="cmi71danb4is0b7b4eogo3s07?utm_source=link" title=""  />

## 組織に対する MFA 強制の無効化\{#disable-mfa-enforcement-for-organization}

<Admonition type="info" icon="📘" title="Notes">

<p>この機能にアクセスするには、組織オーナーである必要があります。</p>

</Admonition>

組織レベルの MFA 強制が無効になると：

- ユーザーは組織にアクセスするために MFA を設定する必要がなくなります。

- すでに MFA を有効にしているユーザーは既存の設定を維持し、自身のアカウントに対して MFA を [オフにする](./multi-factor-auth#disable-mfa) ことを選択できます。

次のデモでは、組織に対する MFA 強制を無効にする方法を示します。

<Supademo id="cmi71q0gk4j6hb7b4xiywity3?utm_source=link" title=""  />

## トラブルシューティング\{#troubleshooting}

1. **認証アプリへのアクセスを失った場合はどうすればよいですか？**

    認証アプリへのアクセスを失ったために MFA を完了できない、またはログインできない場合は、組織オーナーに連絡するか、[Zilliz Cloud サポート](http://support.zilliz.com) にお問い合わせください。

1. **私のアカウントは SSO を使用しています。MFA はどのように処理されますか？**

    組織で SSO が有効になっている場合、MFA は Zilliz Cloud ではなく、アイデンティティプロバイダー (IdP) によって管理されます。IdP アカウントで MFA を構成するか、組織オーナーに連絡してください。

1. **なぜ MFA を無効にできないのですか？**

    組織で MFA 強制が有効になっている場合、自身のアカウントの MFA をオフにすることはできません。

1.  **私は組織オーナーですが、MFA 強制後に一部のユーザーがロックアウトされました。どうすればよいですか？**

    それらのユーザーに、ログイン時に表示されるプロンプトに従って MFA の設定を完了するよう依頼してください。それでも組織にアクセスできない場合は、[Zilliz Cloud サポート](http://support.zilliz.com) にお問い合わせください。

