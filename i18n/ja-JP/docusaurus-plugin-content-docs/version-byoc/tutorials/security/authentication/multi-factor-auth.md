---
title: "MFA | BYOC"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
notebook: FALSE
description: "認証は、ログイン過程で自分の身元を確認するためのゲートウェイとして機能します。Zilliz Cloudは、パスワード以外の追加の検証が必要な高度なログイン方法であるマルチファクタ認証(MFA)を提供することで、このセキュリティを強化しています。MFAは、不正アクセスに対する効果的な対策であり、すべてのユーザーに推奨されています。現在、Webコンソールで作業用メールとパスワード管理可能なMFAに登録したユーザーのみが対象です。MFAを有効にすると、追加のセキュリティのために、各ログイン試行時にパスワードとメール検証コードの両方を入力する必要があります。 | BYOC"
type: origin
token: Wj8NwX9SeidXQokJn3qctFuWnzY
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - mfa
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# MFA

認証は、ログイン過程で自分の身元を確認するためのゲートウェイとして機能します。Zilliz Cloudは、パスワード以外の追加の検証が必要な高度なログイン方法であるマルチファクタ認証(MFA)を提供することで、このセキュリティを強化しています。MFAは、不正アクセスに対する効果的な対策であり、すべてのユーザーに推奨されています。現在、Webコンソールで作業用メールとパスワード管理可能なMFAに登録したユーザーのみが対象です。MFAを有効にすると、追加のセキュリティのために、各ログイン試行時にパスワードとメール検証コードの両方を入力する必要があります。

### MFAを有効にする{#enable-mfa}

1. あなたの**プロフィール**に行き、**アカウント設定**を選択してください。

1. [多要素認証]トグルをオンにします。

1. ダイアログボックスで、アカウントのパスワードを入力して確認してください。

1. 登録したメールアドレスに送信された認証コードを入力して、本人確認を行ってください。

1. ログインページにリダイレクトされます。MFAが正常に有効になったことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="ノート">

<p>Googleにリンクされたアカウントを持つユーザーは、Google独自のMFA設定の対象となります。詳細については、「<a href="https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証をオン</a>にする」を参照してください。</p>
<p>同様に、GitHubにリンクされたアカウントのMFA設定はGitHubによって管理されます。詳細については、<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication">2要素認証の構成</a>を参照してください。</p>

</Admonition>

![enable_mfa_en](/byoc/ja-JP/enable_mfa_en.png)

### MFAを無効にする{#disable-mfa}

1. あなたの**プロフィール**に行き、**アカウント設定**を選択してください。

1. [多要素認証]トグルをオフにします。

1. ダイアログボックスで、[**無効**にする]をクリックしてアクションを確認します。

1. メールアドレスに送信された認証コードを入力して、本人確認を行います。**無効**にするをクリックします。

1. MFAが正常に無効になったことを通知するプロンプトが表示されます。

<Admonition type="info" icon="📘" title="ノート">

<p>Googleにリンクされたアカウントを持つユーザーは、Google独自のMFA設定の対象となります。詳細については、「<a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">2段階認証をオフ</a>にする」を参照してください。</p>
<p>同様に、GitHubにリンクされたアカウントのMFA設定はGitHubによって管理されます。詳細については、「<a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">個人アカウントの2要素認証を無効</a>にする」を参照してください。</p>

</Admonition>

