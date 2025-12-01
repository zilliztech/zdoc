---
title: "MFA | Cloud"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "認証はログインプロセス中に本人を確認するためのゲートウェイとして機能します。Zilliz Cloudはマルチファクタ認証（MFA）を提供することで、このセキュリティを強化しています。MFAはパスワード以外の追加の検証を要求する高度なログイン方法です。MFAは不正アクセスへの有効な対策であり、すべてのユーザーにお勧めします。現在のところ、業務用メールアドレスとパスワードで登録したユーザーのみがWebコンソールでMFAを管理できます。MFAが有効な場合、追加のセキュリティのために各ログイン試行時にパスワードとメール検証コードの両方を入力する必要があります。 | Cloud"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - mfa
  - 密ベクトル
  - 階層的ナビgableスモールワールド
  - 密埋め込み
  - Faissベクターデータベース

---

import Admonition from '@theme/Admonition';


# MFA

認証はログインプロセス中に本人を確認するためのゲートウェイとして機能します。Zilliz Cloudはマルチファクタ認証（MFA）を提供することで、このセキュリティを強化しています。MFAはパスワード以外の追加の検証を要求する高度なログイン方法です。MFAは不正アクセスへの有効な対策であり、すべてのユーザーにお勧めします。現在のところ、業務用メールアドレスとパスワードで登録したユーザーのみがWebコンソールでMFAを管理できます。MFAが有効な場合、追加のセキュリティのために各ログイン試行時にパスワードとメール検証コードの両方を入力する必要があります。

### MFAを有効化\{#enable-mfa}

1. **プロフィール**に移動し、**アカウント設定**を選択します。

1. マルチファクタ認証トグルを有効化します。

1. ダアログボックスで、アカウントパスワードを入力して確認します。

1. 登録したメールアドレスに送信された検証コードを入力して本人確認を行います。

1. ロギンページにリダイレクトされます。MFAが正常に有効化されたことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="ノート">

<p>Googleに連携されたアカウントを持つユーザーは、Google自身のMFA設定の対象となります。詳しくは、<a href="https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証を有効化</a>を参照してください。</p>
<p>同様に、GitHubに連携されたアカウントのMFA設定はGitHubによって管理されます。詳しくは、<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication">二要素認証の設定</a>を参照してください。</p>

</Admonition>

![enable_mfa_en](/img/enable_mfa_en.png)

### MFAを無効化\{#disable-mfa}

1. **プロフィール**に移動し、**アカウント設定**を選択します。

1. マルチファクタ認証トグルを無効化します。

1. ダアログボックスで、**無効化**をクリックしてアクションを確認します。

1. メールアドレスに送信された検証コードを入力して本人確認を行います。<b>無効化</b>をクリックします。

1. MFAが正常に無効化されたことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="ノート">

<p>Googleに連携されたアカウントを持つユーザーは、Google自身のMFA設定の対象となります。詳しくは、<a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証を無効化</a>を参照してください。</p>
<p>同様に、GitHubに連携されたアカウントのMFA設定はGitHubによって管理されます。詳しくは、<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">個人アカウントの二要素認証を無効化</a>を参照してください。</p>

</Admonition>