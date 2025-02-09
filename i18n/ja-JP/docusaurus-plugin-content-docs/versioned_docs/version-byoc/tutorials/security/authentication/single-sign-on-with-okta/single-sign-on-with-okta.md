---
title: "Oktaによるシングルサインオン | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "SSO with Okta"
beta: PUBLIC
notebook: FALSE
description: "シングルサインオン（SSO）とは、複数のアプリケーションやサービスに対して別々のログインを必要とせず、1つの資格情報でログインできる機能です。 | BYOC"
type: origin
token: ALx5wPXhzi6ocCkDqN5cojpAnKe
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';


# Oktaによるシングルサインオン

シングルサインオン（SSO）とは、複数のアプリケーションやサービスに対して別々のログインを必要とせず、1つの資格情報でログインできる機能です。

Zilliz Cloudは、[Okta](https://www.okta.com/)をアイデンティティプロバイダ(IdP)として使用して、Open ID Connect([OIDC](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_oidc.htm))または[SAML 2.0](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm)プロトコルを介してSSOを有効にすることをサポートしています。この機能は組織レベルで機能します。Oktaと統合することで、Oktaの資格情報を使用してサインインし、Zilliz Cloudリソースにアクセスできます。



import DocCardList from '@theme/DocCardList';

<DocCardList />