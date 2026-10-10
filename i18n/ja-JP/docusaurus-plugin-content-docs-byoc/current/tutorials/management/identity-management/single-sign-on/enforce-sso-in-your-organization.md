---
title: "組織で SSO を強制する | BYOC"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織で、メンバーが ID プロバイダー（IdP）経由でのサインインを必須としている場合、シングルサインオン（SSO）を構成するだけではその要件を満たせません。メンバーは、email/password または Google や GitHub などのサードパーティアカウントを使用して Zilliz Cloud にログインできます。 | BYOC"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 組織で SSO を強制する

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

この機能は、Enterprise プラン以上および BYOC デプロイでのみ利用できます。

</FeatureNote>

組織で、メンバーが ID プロバイダー（IdP）経由でのサインインを必須としている場合、シングルサインオン（SSO）を構成するだけではその要件を満たせません。メンバーは、email/password または Google や GitHub などのサードパーティアカウントを使用して Zilliz Cloud にログインできます。

コンソールアクセスに SSO を必須とするには、SSO 強制を有効にします。この要件は、Organization Owner を含むすべてのメンバーに適用することも、Organization Owner に他のログイン方法の使用を許可することもできます。

## オーナーの免除\{#owner-exemption}

SSO 強制では、Organization Owner も SSO を使用する必要があるかどうかを選択できます。オーナーの免除を許可すると、SSO ログインが失敗した場合にオーナーがコンソールにアクセスして組織を管理するための代替手段が提供されます。

組織の認証要件を満たすポリシーを選択してください。

| ポリシー | 意味 |
| --- | --- |
| **Allow Owner exemption**（デフォルト） | Organization Owner は、email/password またはサードパーティアカウントを使用してログインできます。これにより、SSO 構成の問題を解決するためにコンソールにアクセスできます。他のメンバーは SSO を使用する必要があります。 |
| **Require SSO for everyone** | Organization Owner を含むすべてのメンバーが、IdP 経由で認証する必要があります。組織がオーナーの例外なしで SSO を必須とする場合は、このポリシーを使用します。 |

<Admonition type="warning" title="Warning">

Organization Owner に SSO を必須とする前に、SSO 経由で正常にログインできることを確認してください。SSO 構成のエラーにより全員がログインできなくなった場合は、アクセスを復元するためにサポートにお問い合わせください。

</Admonition>

組織で SSO 強制がすでに有効になっている場合、この更新後もオーナーの免除は有効のままです。Organization Owner は、自動的に SSO に切り替えることを必須とされることはありません。

複数の組織に所属している場合、1 つの組織で免除されていても、必ずしも SSO なしでログインできるとは限りません。別の組織で SSO が強制されており、その組織で Organization Owner でない場合は、引き続き SSO を使用する必要があります。その組織がオーナーの免除を許可していない場合も同様です。

<details>

<summary>複数の組織にわたるオーナーの免除の仕組み</summary>

所属している **SSO 強制が有効なすべての組織** で、次の条件を満たす場合にのみ、SSO なしでログインできます。

- **Organization Owner** であること。

- その組織が、Organization Owner に SSO なしでのログインを許可していること。

いずれかの条件が満たされない場合は、アクセスしようとしている組織に関係なく、SSO を使用する必要があります。

| ロールと組織の設定 | SSO なしでログインできますか？ |
| --- | --- |
| すべての SSO 強制組織でオーナーであり、それらすべてがオーナーの免除を許可しています。 | はい |
| 少なくとも 1 つの SSO 強制組織で一般メンバーです。 | いいえ |
| すべての SSO 強制組織でオーナーですが、少なくとも 1 つがオーナーの免除を許可していません。 | いいえ |

SSO 強制を有効にしていない組織は、この制限を追加しません。そのような組織でオーナーであっても、別の組織のポリシーから免除されるわけではありません。

これらのルールは、SSO 以外のログインを使用できるかどうかを決定します。各組織の SSO を通じて個別にサインインすることを要求するものではありません。

</details>

## 事前準備\{#before-you-start}

SSO 強制を有効にする前に、次の確認を完了してください。

- 対象の組織で **Organization Owner** であること。

- 組織の SSO を構成して有効にし、SSO ログインが成功することを確認していること。設定手順については、[Okta（OIDC）](./openid-connect) など、使用する IdP の構成ガイドを参照してください。

- 対象となるすべてのメンバーを IdP の SSO アプリケーションに割り当て、SSO 経由で正常にログインできることを確認していること。オーナーの免除をオフにする前に、**自身も SSO 経由でログインできる**ことを確認してください。

- IdP を通じて組織メンバーをプロビジョニングする準備をしていること。強制を有効にすると、組織メンバーの直接招待が無効になります。プロジェクトレベルの招待は、既存の組織メンバーに限定されます。

- 多要素認証（MFA）を必須とする場合は、IdP で構成していること。Zilliz Cloud で組織に対して有効になっている [MFA](./multi-factor-auth) は、SSO 強制を有効にすると自動的に無効になります。

## SSO 強制を有効にする\{#enable-sso-enforcement}

<Admonition type="warning" title="Warning">

SSO 強制を有効にすると、SSO 経由で認証されたセッションを含め、免除されていないメンバーのすべてのアクティブセッションが即座に無効になります。影響を受けるメンバーは、SSO 経由で再度ログインする必要があります。オーナーの免除をオフにすると、自分自身を含む Organization Owner にも適用されます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO 強制を有効にする組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Single Sign-On (SSO)** セクションを見つけます。SSO が構成され、有効になっていることを確認します。

1. **Enforce SSO Login** をオンにします。**Enable SSO Enforcement** ダイアログが開きます。

1. **Allow Organization Owners to log in without SSO** を設定します。これをオンにすると、他の組織のポリシーに従うことを条件に、オーナーの免除が許可されます。オフにすると、Organization Owner を含む全員に SSO が必須となります。

1. 続行する前に影響を確認します。免除されていないメンバーは、SSO 経由でログインした場合でも、すべてログアウトされます。オーナーの免除をオフにした場合は、自身もログアウトされます。設定を適用するには **Enable** をクリックします。

</Procedures>

選択したオーナーの免除設定で SSO 強制が有効になりました。免除されていないメンバーは、SSO 経由でログインする必要があります。Zilliz Cloud は、**SSO Login URL** を含むメールを Organization Owner に送信します。

## SSO 強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. クリックして確定します。

</Procedures>

SSO 強制を無効にすると、この組織の SSO 使用要件が解除されます。メンバーは、所属する他の組織がオーナーの免除ルールの下で SSO の使用を要求していない場合に限り、既存の SSO 以外のログイン方法を使用できます。

## FAQ\{#faq}

**SSO 強制を有効にした後にログインできない場合はどうすればよいですか？**

組織の SSO Login URL を使用して再度ログインしてください。Organization Owner は、強制が有効になったときにこの URL をメールで受け取ります。

オーナーの免除がオフになっており、IdP の構成が正しくないために全員がログインできない場合は、アクセスの復元についてサポートにお問い合わせください。この場合、Organization Owner は email/password またはサードパーティアカウントで強制を回避することはできません。
