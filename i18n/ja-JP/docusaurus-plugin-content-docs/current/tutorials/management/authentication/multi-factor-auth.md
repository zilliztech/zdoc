---
title: "MFA | Cloud"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "認証は、Zilliz Cloud にサインインする際に本人確認を行います。このプロセスを強化するために、Zilliz Cloud は多要素認証（MFA）をサポートしています。 | Cloud"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MFA

認証は、Zilliz Cloud にサインインする際に本人確認を行います。このプロセスを強化するために、Zilliz Cloud は多要素認証（MFA）をサポートしています。

MFA を有効にすると、ログイン時に次の 2 つの要素を提示する必要があります。

- アカウントのパスワード

- 認証アプリ（例: Google Authenticator、Microsoft Authenticator など）からの TOTP（time-based one-time password）

<Admonition type="info" icon="📘" title="📘 Notes">

Zilliz Cloud は、アカウントセキュリティを強化するために MFA をアップグレードしました。**2025 年 11 月 25 日**より、メールベースの MFA は廃止されます。以前メールベースの MFA を使用していたユーザーは、TOTP 認証アプリに切り替える必要があります。

</Admonition>

## Considerations\{#considerations}

- **SSO との互換性**: 組織で [SSO](./single-sign-on) が有効になっている場合、MFA は ID プロバイダー（IdP）によって管理されます。この場合は、IdP アカウントで MFA を設定するか、Organization Owner にお問い合わせください。

- **ログイン方法の互換性**: 組み込みの Zilliz Cloud MFA 機能は、メールアドレスとパスワードで[登録](./register-with-zilliz-cloud#registration-options)したユーザーのみが利用できます。

    - アカウントが Google にリンクされている場合、MFA は Google によって管理されます。詳細については、[2 段階認証プロセスを有効にする](https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP) を参照してください。

    - アカウントが GitHub にリンクされている場合、MFA は GitHub によって管理されます。詳細については、[2 要素認証を設定する](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication) を参照してください。

## Enable MFA\{#enable-mfa}

次のデモでは、自分のアカウントに対して MFA を有効にする方法を示します。このデモでは Microsoft Authenticator を例として使用していますが、TOTP 互換の認証アプリであればどれでも使用できます。

<Supademo id="cmi72ns5s4jwob7b4ul2t1zz5?utm_source=link" title=""  />

## Disable MFA\{#disable-mfa}

<Admonition type="info" icon="📘" title="📘 Notes">

組織で [MFA の強制](./multi-factor-auth#enforce-mfa-for-all-organization-users) が有効になっている場合、自分のアカウントの MFA を無効にすることはできません。

</Admonition>

次のデモでは、自分のアカウントに対して MFA を無効にする方法を示します。

<Supademo id="cmi7297fo4jq8b7b448ydxlhk?utm_source=link" title=""  />

## Enforce MFA for all organization users\{#enforce-mfa-for-all-organization-users}

<Admonition type="info" icon="📘" title="📘 Notes">

この機能にアクセスするには、Organization Owner である必要があります。

この機能を使用するには、有効な支払い方法、**Enterprise** プロジェクト、および **Dedicated** クラスターが必要です。

</Admonition>

組織レベルの MFA の強制が有効になると、次のようになります。

- 組織内のすべてのユーザーは、サインインするために [MFA を設定](./multi-factor-auth#enable-mfa)する必要があります。

- まだ MFA を有効にしていないユーザーには、次回ログイン時に設定を求めるメッセージが表示されます。

- MFA の設定を完了しないユーザーは、その組織にアクセスできなくなります。

次のデモでは、組織に対して MFA を強制する方法を示します。

<Supademo id="cmi71danb4is0b7b4eogo3s07?utm_source=link" title=""  />

## Disable MFA enforcement for organization\{#disable-mfa-enforcement-for-organization}

<Admonition type="info" icon="📘" title="📘 Notes">

この機能にアクセスするには、Organization Owner である必要があります。

</Admonition>

組織レベルの MFA の強制が無効になると、次のようになります。

- ユーザーは、組織にアクセスするために MFA を設定する必要がなくなります。

- すでに MFA を有効にしているユーザーは既存の設定が保持され、自分のアカウントに対して [MFA をオフにする](./multi-factor-auth#disable-mfa) こともできます。

次のデモでは、組織に対する MFA の強制を無効にする方法を示します。

<Supademo id="cmi71q0gk4j6hb7b4xiywity3?utm_source=link" title=""  />

## Troubleshooting\{#troubleshooting}

1. **認証アプリにアクセスできなくなった場合はどうすればよいですか？**

    認証アプリにアクセスできなくなったために MFA を完了できない、またはログインできない場合は、Organization Owner に連絡するか、[Zilliz Cloud サポートにお問い合わせください](http://support.zilliz.com)。

1. **自分のアカウントは SSO を使用しています。MFA はどのように処理されますか？**

    組織で SSO が有効になっている場合、MFA は Zilliz Cloud ではなく、ID プロバイダー（IdP）によって管理されます。IdP アカウントで MFA を設定するか、Organization Owner にお問い合わせください。

1. **MFA を無効にできないのはなぜですか？**

    組織で MFA の強制が有効になっている場合、自分のアカウントに対して MFA をオフにすることはできません。 

1.  **私は Organization Owner ですが、MFA の強制の後に一部のユーザーがロックアウトされています。どうすればよいですか？**

    それらのユーザーに、ログイン時に表示される案内に従って MFA の設定を完了するよう依頼してください。それでも組織にアクセスできない場合は、[Zilliz Cloud サポートにお問い合わせください](http://support.zilliz.com)。

