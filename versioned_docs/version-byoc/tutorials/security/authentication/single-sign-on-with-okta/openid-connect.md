---
title: "OpenID Connect | BYOC"
slug: /openid-connect
sidebar_label: "Configure OIDC SSO with Okta"
beta: CONTACT SALES
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Okta using the OpenID Connect protocol. | BYOC"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search

---

import Admonition from '@theme/Admonition';


# OpenID Connect

This topic describes how to configure single sign-on (SSO) with Okta using the [OpenID Connect](https://openid.net/developers/how-connect-works/) (OIDC) protocol.

OIDC is an authentication protocol built on top of OAuth 2.0. It allows for seamless and secure authentication between Zilliz Cloud and Okta. Choose this option if you're using Okta as your identity provider and want to take advantage of Okta-specific features and potentially simpler setup processes. For details, refer to [Okta official documentation](https://help.okta.com/en-us/Content/Topics/Apps/apps-about-oidc.htm).

![EfRWwnbKNhcXEwbL7EBcB66inrd](/byoc/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud SSO is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the Organization Owner of the organization where SSO is to be configured.

- You have Admin access to the Okta console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

## Step 1: Create OIDC app integration in Okta{#step-1-create-oidc-app-integration-in-okta}

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **OIDC - OpenID Connect** as the sign-in method, then select **Web Application** as the application type. Click **Next**.

1. Set up the new Web App integration with the following settings: 

    - **App integration name**: Enter a name for your integration (e.g., **Zilliz Cloud**).

    - **Grant type**: Ensure **Authorization Code** is selected.

    - **Sign-in redirect URIs**: For now, use any placeholder value. You'll need to update this config later.

    - **Controlled access**: Choose **Skip group assignment for now** unless you want to set up specific group access.

1. Click **Save** to create the application. Then, you'll be taken to the application's settings page.

1. Find the **Client Credentials** section, and copy **Client ID** and **Secret**. You'll need these for [Step 2](./openid-connect) in Zilliz Cloud.

![sso-oidc-2](/byoc/sso-oidc-2.png)

## Step 2: Configure Okta Workforce connection on Zilliz Cloud{#step-2-configure-okta-workforce-connection-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the **Configure Single Sign-On (SSO)** dialog, you will see two options - **SAML 2.0** and **Okta Workforce**. For this guide, select **Okta Workforce** to proceed with the Okta Client integration.

1. In the **Okta Domain** field, enter your domain name related to your organization (e.g. **yourdomain.okta.com**). For steps on how to obtain your domain name, refer to [Find your Okta domain](https://developer.okta.com/docs/guides/find-your-domain/main/).

1. Paste the **Client ID** and **Secret** you copied in [Step 1](./openid-connect) from the [Okta Admin console](https://login.okta.com/).

1. Click **Save** to proceed.

![sso-oidc-1](/byoc/sso-oidc-1.png)

## Step 3: Update Okta app integration{#step-3-update-okta-app-integration}

After saving the Okta integration details on Zilliz Cloud, you'll be provided with a redirect URL:

1. Copy the provided redirect URL from the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Return to your [Okta Admin console](https://login.okta.com/) and navigate to the application you've set up for Zilliz Cloud.

1. In the **General Settings** area, edit the application settings.

    1. In the **Sign-in redirect URIs** field, paste the redirect URL you copied from Zilliz Cloud.

    1. Save the changes in the [Okta Admin console](https://login.okta.com/).

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and confirm that you've added the redirect URL in Okta.

You will also see a Zilliz Cloud login URL. Save this URL as it will be used for SSO login once the setup is complete.

![sso-oidc-3](/byoc/sso-oidc-3.png)

## Step 4: Assign Okta application to users{#step-4-assign-okta-application-to-users}

Before users can access Zilliz Cloud through SSO, you need to assign the Okta application to them:

1. In the [Okta Admin console](https://login.okta.com/), go to **Directory** > **People**.

1. Select a user and go to the **Applications** tab.

1. Click **Assign Applications** and find the Zilliz Cloud application.

1. Assign the application to the user and save the changes.

Repeat this process for all users who need SSO access to Zilliz Cloud. For more information, refer to [Okta official documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm).

![sso-4](/byoc/sso-4.png)

## Test configuration{#test-configuration}

To ensure your SSO setup is functional:

1. Open a new browser window and navigate to the Zilliz Cloud SSO login URL provided earlier.

1. You should be redirected to the Okta login page.

1. Log in using the credentials of a user who has been assigned the Zilliz Cloud application in Okta.

1. If SSO is configured correctly, you will be redirected to the [Zilliz Cloud console](https://cloud.zilliz.com/login) after successful authentication.

<Admonition type="info" icon="📘" title="Notes">

<p>By default, users logging in via SSO are granted the Organization Member role. To expand their permissions, you can modify their roles in the Zilliz Cloud console.</p>

</Admonition>

If you encounter any issues during the setup or testing process, please contact Zilliz support for assistance.