---
title: "MFA | BYOC"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "認証は、ログインプロセス中に本人確認を行うためのゲートウェイとして機能します。Zilliz Cloudは、パスワード以外の追加認証を必要とする高度なログイン方法である多要素認証（MFA）を提供することで、このセキュリティを強化しています。MFAは不正アクセスに対する有効な対策であり、すべてのユーザーに推奨されます。現在、勤務先メールアドレスとパスワードで登録したユーザーのみがWebコンソールでMFAを管理できます。MFAが有効になっている場合、追加のセキュリティのために、各ログイン試行時にパスワードとメール認証コードの両方を入力する必要があります。 | BYOC"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - mfa
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル
  - 画像類似検索

---

import Admonition from '@theme/Admonition';


# MFA

認証は、ログインプロセス中に本人確認を行うためのゲートウェイとして機能します。Zilliz Cloudは、パスワード以外の追加認証を必要とする高度なログイン方法である多要素認証（MFA）を提供することで、このセキュリティを強化しています。MFAは不正アクセスに対する有効な対策であり、すべてのユーザーに推奨されます。現在、勤務先メールアドレスとパスワードで登録したユーザーのみがWebコンソールでMFAを管理できます。MFAが有効になっている場合、追加のセキュリティのために、各ログイン試行時にパスワードとメール認証コードの両方を入力する必要があります。

### MFAの有効化\{#enable-mfa}

1. **プロフィール**に移動し、**アカウント設定**を選択します。

1. 多要素認証のトグルを有効化します。

1. ダイアログボックスで、アカウントパスワードを入力して確認します。

1. 登録したメールアドレスに送信された認証コードを入力して、本人確認を行います。

1. ログインページにリダイレクトされます。MFAが正常に有効化されたことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="注意">

<p>Googleにリンクされたアカウントを持つユーザーは、Google独自のMFA設定の対象となります。詳細については、<a href="https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証をオンにする</a>を参照してください。</p>
<p>同様に、GitHubにリンクされたアカウントのMFA設定はGitHubによって管理されます。詳細については、<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication">二要素認証の設定</a>を参照してください。</p>

</Admonition>

![enable_mfa_en](/img/enable_mfa_en.png)

### MFAの無効化\{#disable-mfa}

1. **プロフィール**に移動し、**アカウント設定**を選択します。

1. 多要素認証のトグルを無効化します。

1. ダイアログボックスで、**無効化**をクリックして操作を確認します。

1. メールアドレスに送信された認証コードを入力して本人確認を行います。**無効化**をクリックします。

1. MFAが正常に無効化されたことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="注意">

<p>Googleにリンクされたアカウントを持つユーザーは、Google独自のMFA設定の対象となります。詳細については、<a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証をオフにする</a>を参照してください。</p>
<p>同様に、GitHubにリンクされたアカウントのMFA設定はGitHubによって管理されます。詳細については、<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">個人アカウントの二要素認証を無効にする</a>を参照してください。</p>

</Admonition>