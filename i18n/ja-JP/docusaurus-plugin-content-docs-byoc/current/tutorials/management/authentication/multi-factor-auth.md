---
title: "MFA | BYOC"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "認証は、Zilliz Cloud にサインインする際に本人確認を行います。このプロセスを強化するため、Zilliz Cloud は多要素認証（MFA）をサポートしています。 | BYOC"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MFA

認証は、Zilliz Cloud にサインインする際に本人確認を行います。このプロセスを強化するため、Zilliz Cloud は多要素認証（MFA）をサポートしています。

MFA を有効にすると、ログイン時に次の 2 つの要素を提示する必要があります。

- アカウントのパスワード

- 認証アプリからの TOTP（time-based one-time password）（例: Google Authenticator、Microsoft Authenticator など）

<Admonition type="info" icon="📘" title="📘 Notes">

Zilliz Cloud は、アカウントセキュリティを強化するために MFA をアップグレードしました。**2025 年 11 月 25 日**より、メールベースの MFA は非推奨となります。これまでメールベースの MFA を使用していたユーザーは、TOTP 認証アプリに切り替える必要があります。

</Admonition>

## 考慮事項\{#considerations}

- **SSO compatibility**: 組織で [SSO](./single-sign-on) が有効になっている場合、MFA は ID プロバイダー（IdP）によって管理されます。この場合は、IdP アカウントで MFA を設定するか、Organization Owner に問い合わせてください。

- **Login method compatibility**: 組み込みの Zilliz Cloud MFA 機能は、メールアドレスとパスワードで[登録](./register-with-zilliz-cloud#registration-options)したユーザーのみ利用できます。

    - アカウントが Google にリンクされている場合、MFA は Google によって管理されます。詳細については、[2 段階認証プロセスを有効にする](https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP) を参照してください。

    - アカウントが GitHub にリンクされている場合、MFA は GitHub によって管理されます。詳細については、[2 要素認証の設定](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) を参照してください。

## MFA を有効にする\{#enable-mfa}

以下のデモでは、自分のアカウントに対して MFA を有効にする方法を示します。このデモでは Microsoft Authenticator を例として使用していますが、TOTP に対応した任意の認証アプリを使用できます。

<Supademo id="cmi72ns5s4jwob7b4ul2t1zz5?utm_source=link" title=""  />

## MFA を無効にする\{#disable-mfa}

<Admonition type="info" icon="📘" title="📘 Notes">

組織で [MFA enforcement](./multi-factor-auth#enforce-mfa-for-all-organization-users) が有効になっている場合、アカウントの MFA を無効にすることはできません。

</Admonition>

以下のデモでは、自分のアカウントに対して MFA を無効にする方法を示します。

<Supademo id="cmi7297fo4jq8b7b448ydxlhk?utm_source=link" title=""  />

## すべての組織ユーザーに MFA を強制する\{#enforce-mfa-for-all-organization-users}

<Admonition type="info" icon="📘" title="📘 Notes">

この機能にアクセスするには Organization Owner である必要があります。

この機能を使用するには、有効な支払い方法、**Enterprise** プロジェクト、および **Dedicated** クラスターが必要です。

</Admonition>

組織レベルの MFA 強制を有効にすると、次のようになります。

- 組織内のすべてのユーザーは、サインインするために [MFA を設定](./multi-factor-auth#enable-mfa)する必要があります。

- まだ MFA を有効にしていないユーザーには、次回ログイン時に設定を促すメッセージが表示されます。

- MFA の設定を完了しないユーザーは、その組織にアクセスできません。

以下のデモでは、組織に対して MFA を強制する方法を示します。

<Supademo id="cmi71danb4is0b7b4eogo3s07?utm_source=link" title=""  />

## 組織に対する MFA 強制を無効にする\{#disable-mfa-enforcement-for-organization}

<Admonition type="info" icon="📘" title="📘 Notes">

この機能にアクセスするには Organization Owner である必要があります。

</Admonition>

組織レベルの MFA 強制を無効にすると、次のようになります。

- ユーザーは、組織にアクセスするために MFA を設定する必要がなくなります。

- すでに MFA を有効にしているユーザーは既存の設定が維持され、自分のアカウントで [MFA をオフにする](./multi-factor-auth#disable-mfa)ことを選択できます。

以下のデモでは、組織に対する MFA 強制を無効にする方法を示します。

<Supademo id="cmi71q0gk4j6hb7b4xiywity3?utm_source=link" title=""  />

## トラブルシューティング\{#troubleshooting}

1. **認証アプリにアクセスできなくなった場合はどうすればよいですか？**

    認証アプリにアクセスできなくなり、MFA を完了できない、またはログインできない場合は、Organization Owner に連絡するか、[Zilliz Cloud サポートにお問い合わせください](http://support.zilliz.com)。

1. **自分のアカウントで SSO を使用しています。MFA はどのように処理されますか？**

    組織で SSO が有効になっている場合、MFA は Zilliz Cloud ではなく ID プロバイダー（IdP）によって管理されます。IdP アカウントで MFA を設定するか、Organization Owner に問い合わせてください。

1. **MFA を無効にできないのはなぜですか？**

    組織で MFA 強制が有効になっている場合、自分のアカウントの MFA をオフにすることはできません。 

1.  **私は Organization Owner ですが、MFA 強制後に一部のユーザーがロックアウトされました。どうすればよいですか？**

    それらのユーザーに、ログイン時の案内に従って MFA の設定を完了するよう依頼してください。それでも組織にアクセスできない場合は、[Zilliz Cloud サポートにお問い合わせください](http://support.zilliz.com)。

