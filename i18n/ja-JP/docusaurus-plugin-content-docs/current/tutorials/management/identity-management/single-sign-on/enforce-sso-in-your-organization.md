---
title: "組織で SSO を強制する | Cloud"
slug: /enforce-sso-in-your-organization
sidebar_label: "組織で SSO を強制する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "組織でメンバーが ID プロバイダー（IdP）経由でのサインインを必須としている場合、シングルサインオン（SSO）を構成するだけではその要件を満たしません。メンバーは依然として、email/password や Google、GitHub などのサードパーティアカウントを使用して Zilliz Cloud にログインできます。 | Cloud"
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

組織でメンバーが ID プロバイダー（IdP）経由でのサインインを必須としている場合、シングルサインオン（SSO）を構成するだけではその要件を満たしません。メンバーは依然として、email/password や Google、GitHub などのサードパーティアカウントを使用して Zilliz Cloud にログインできます。

コンソールへのアクセスに SSO を必須とするには、SSO の強制を有効にします。この要件は、**Organization Owner** を含むすべてのメンバーに適用することも、**Organization Owner** に他のログイン方法の使用を許可することもできます。

## オーナーの適用除外\{#owner-exemption}

SSO の強制を有効にすると、**Organization Owner** にも SSO の使用を必須とするかどうかを選択できます。オーナーの適用除外を許可すると、SSO ログインが失敗した場合に、オーナーがコンソールにアクセスして組織を管理するための代替手段が提供されます。

組織の認証要件を満たすポリシーを選択してください。

| ポリシー | 内容 |
| --- | --- |
| **Allow Owner exemption**（デフォルト） | **Organization Owner** は email/password またはサードパーティアカウントを使用してログインできます。これにより、SSO 構成の問題を解決するためにコンソールにアクセスできます。他のメンバーは SSO を使用する必要があります。 |
| **Require SSO for everyone** | **Organization Owner** を含むすべてのメンバーが、IdP を介して認証する必要があります。組織でオーナーの例外なしに SSO を必須とする場合は、このポリシーを使用します。 |

<Admonition type="warning" title="Warning">

**Organization Owner** に SSO を必須とする前に、SSO 経由で正常にログインできることを確認してください。SSO 構成のエラーにより全員がログインできなくなった場合は、アクセスを復旧するためにサポートへお問い合わせいただく必要があります。

</Admonition>

組織で既に SSO の強制が有効になっている場合、この更新後もオーナーの適用除外は有効のままです。**Organization Owner** は自動的に SSO への切り替えを必須とされることはありません。

複数の組織に所属している場合、1 つの組織で適用除外されていても、必ずしも SSO なしでログインできるとは限りません。別の組織で SSO が強制されており、その組織で **Organization Owner** でない場合は、引き続き SSO を使用する必要があります。その組織がオーナーの適用除外を許可していない場合も同様です。

<details>

<summary>複数の組織にわたるオーナーの適用除外の仕組み</summary>

所属している **SSO の強制が有効なすべての組織** で、次の条件を満たす場合にのみ、SSO なしでログインできます。

- **Organization Owner** である必要があります。

- 組織が **Organization Owner** に SSO なしでのログインを許可している必要があります。

いずれかの条件を満たしていない場合は、アクセスしようとしている組織にかかわらず、SSO を使用する必要があります。

| ロールと組織の設定 | SSO なしでログインできますか？ |
| --- | --- |
| SSO が強制されているすべての組織でオーナーであり、それらすべてがオーナーの適用除外を許可しています。 | はい |
| 少なくとも 1 つの SSO 強制組織で一般メンバーです。 | いいえ |
| SSO が強制されているすべての組織でオーナーですが、少なくとも 1 つの組織がオーナーの適用除外を許可していません。 | いいえ |

SSO の強制が有効でない組織は、この制限を追加しません。そのような組織でオーナーであっても、別の組織のポリシーが免除されるわけではありません。

これらのルールは、SSO 以外のログインを使用できるかどうかを決定します。各組織の SSO を介して個別にサインインすることを必須とするものではありません。

</details>

## 事前準備\{#before-you-start}

SSO の強制を有効にする前に、次の確認を行ってください。

- 対象組織で **Organization Owner** であること。

- 組織の SSO を構成して有効にし、SSO ログインが成功することを確認すること。設定手順については、[Okta（OIDC）](./openid-connect) など、お使いの IdP の構成ガイドを参照してください。

- IdP の SSO アプリケーションに、対象となるすべてのメンバーを割り当て、SSO 経由で正常にログインできることを確認すること。オーナーの適用除外を無効にする前に、**自身も SSO 経由でログインできる**ことを確認してください。

- IdP を介して組織メンバーをプロビジョニングする準備をすること。強制を有効にすると、組織メンバーの直接招待が無効になります。プロジェクトレベルの招待は、既存の組織メンバーに限定されます。

- 多要素認証（MFA）が必要な場合は、IdP で構成すること。Zilliz Cloud で組織に対して有効になっている [MFA](./multi-factor-auth) は、SSO の強制を有効にすると自動的に無効になります。

## SSO の強制を有効にする\{#enable-sso-enforcement}

<Admonition type="warning" title="Warning">

SSO の強制を有効にすると、適用除外されていないメンバーのすべてのアクティブセッション（SSO で認証されたセッションを含む）が直ちに無効になります。影響を受けるメンバーは、SSO 経由で再度ログインする必要があります。オーナーの適用除外を無効にした場合、これは **Organization Owner**（自分自身を含む）にも適用されます。

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. [Zilliz Cloud コンソール](https://cloud.zilliz.com/login) にログインし、SSO の強制を有効にする組織に移動します。

1. 左側のナビゲーションペインで **Settings** をクリックします。

1. **Single Sign-On (SSO)** セクションを見つけます。SSO が構成され、有効になっていることを確認します。

1. **Enforce SSO Login** をオンにします。**Enable SSO Enforcement** ダイアログが開きます。

1. **Allow Organization Owners to log in without SSO** を設定します。オンのままにすると、他の組織のポリシーに従うことを条件に、オーナーの適用除外が許可されます。オフにすると、**Organization Owner** を含むすべてのメンバーに SSO が必須となります。

1. 続行する前に影響を確認します。適用除外されていないすべてのメンバーは、SSO 経由でログインした場合でもログアウトされます。オーナーの適用除外を無効にした場合は、自分自身もログアウトされます。設定を適用するには **Enable** をクリックします。

</Procedures>

選択したオーナーの適用除外の設定で、SSO の強制が有効になりました。適用除外されていないメンバーは、SSO 経由でログインする必要があります。Zilliz Cloud は、**Organization Owner** に **SSO Login URL** を含むメールを送信します。

## SSO の強制を無効にする\{#disable-sso-enforcement}

<Procedures>

1. Zilliz Cloud コンソールで **Settings** に移動し、**Single Sign-On (SSO)** セクションを見つけます。

1. **Enforce SSO Login** トグルをオフにします。

1. クリックして確認します。

</Procedures>

SSO の強制を無効にすると、この組織の SSO 使用要件が削除されます。メンバーが既存の SSO 以外のログイン方法を使用できるのは、所属する他のどの組織も、オーナーの適用除外ルールの下で SSO の使用を要求していない場合に限られます。

## FAQ\{#faq}

**SSO の強制を有効にした後にログインできない場合はどうすればよいですか？**

組織の SSO Login URL を使用して再度ログインしてください。**Organization Owner** は、強制が有効になったときにこの URL をメールで受け取ります。

オーナーの適用除外が無効になっており、誤った IdP 構成によって全員がログインできない場合は、アクセスを復旧するためにサポートにお問い合わせください。この場合、**Organization Owner** はemail/password やサードパーティアカウントで強制を回避することはできません。
