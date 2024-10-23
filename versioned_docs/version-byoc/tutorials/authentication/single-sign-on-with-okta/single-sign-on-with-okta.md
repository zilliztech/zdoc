---
title: "Single Sign-on with Okta | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "SSO with Okta"
beta: PUBLIC
notebook: FALSE
description: "Single sign-on (SSO) is a feature that allows users to log in to multiple applications or services with a single set of credentials, rather than requiring separate logins for each. | BYOC"
type: origin
token: SXBNw91txiJhL6kq2ARcvYbRntg
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso

---

import Admonition from '@theme/Admonition';


# Single Sign-on with Okta

Single sign-on (SSO) is a feature that allows users to log in to multiple applications or services with a single set of credentials, rather than requiring separate logins for each.

Zilliz Cloud supports using [Okta](https://www.okta.com/) as the identity provider (IdP) to enable SSO via the OpenID Connect ([OIDC](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_oidc.htm)) or [SAML 2.0](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm) protocol. This feature works at the organization level. By integrating with Okta, you can sign in using your Okta credentials to access Zilliz Cloud resources.

<Admonition type="info" icon="📘" title="Notes">

<p>The SSO feature is currently in Public Preview and available only to users in the whitelist. If you are interested in using this feature, please <a href="https://support.zilliz.com/hc/en-us">submit a ticket</a>.</p>

</Admonition>

import DocCardList from '@theme/DocCardList';

<DocCardList />