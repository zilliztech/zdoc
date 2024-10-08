---
title: "Single Sign-on with Okta | BYOC"
slug: /single-sign-on-with-okta
sidebar_label: "SSO with Okta"
beta: PUBLIC
notebook: FALSE
description: "Single sign-on (SSO) is a feature that allows users to log in to multiple applications or services with a single set of credentials, rather than requiring separate logins for each. | BYOC"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso

---

import Admonition from '@theme/Admonition';


# Single Sign-on with Okta

Single sign-on (SSO) is a feature that allows users to log in to multiple applications or services with a single set of credentials, rather than requiring separate logins for each.

Zilliz Cloud uses [Okta](https://www.okta.com/) as the identity provider (IdP) to enable SSO. Using the [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0) protocol, this feature works at the organization level. By integrating with Okta, you can sign in using your Okta credentials to access Zilliz Cloud resources.

This topic describes how to enable SSO with [Okta](https://www.okta.com/).

<Admonition type="info" icon="📘" title="Notes">

<p>The SSO feature is currently in Public Preview and available only to users in the whitelist. If you are interested in using this feature, please <a href="https://support.zilliz.com/hc/en-us">submit a ticket</a>.</p>

</Admonition>

![AbFzbkyF8o294XxEXBzchRpsnHc](/byoc/AbFzbkyF8o294XxEXBzchRpsnHc.png)

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the Organization Owner of the organization where SSO is to be configured.

- You have Admin access to the Okta console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

## Step 1: Initialize setup on Zilliz Cloud{#step-1-initialize-setup-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **System Settings** page, choose **Actions** > **Configure** in the **Single Sign-On (SSO)** area.

1. In the **Configure Single Sign-On (SSO)** dialog box, copy the URL in the **Zilliz Cloud Redirect URL** field. This will be required for setting up your IdP in the Okta console.

Keep this browser tab open. Proceed to [step 2](./single-sign-on-with-okta#step-2-create-an-integration-in-the-okta-console) for IdP settings in the Okta console.

![sso-1](/byoc/sso-1.png)

## Step 2: Create an integration in the Okta console{#step-2-create-an-integration-in-the-okta-console}

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **SAML 2.0** and click **Next**.

1. Set a custom app name and click **Next**.

1. In the **Configure SAML** step, configure SAML settings. The required parameters are as follows:

    - **Single sign-on URL**: Enter the URL obtained in [step 1](./single-sign-on-with-okta#step-1-initialize-setup-on-zilliz-cloud). This URL is where the SAML assertion is sent via HTTP POST.

    - **Audience URI (SP Entity ID)**: Enter the URL obtained in [step 1](./single-sign-on-with-okta#step-1-initialize-setup-on-zilliz-cloud). This is the identifier that the IdP uses to recognize the Service Provider, which in this case is Zilliz Cloud.

1. Click **Finish**. You will be redirected to the application page.

    ![sso-2-1](/byoc/sso-2-1.png)

1. In the **SAML 2.0** card of the **Sign On** tab, click **More details**. Then, copy the following credentials and certificate: **Sign on URL**, **Issuer**, and **Signing Certificate**. This will be required for setting up your IdP in the Zilliz Cloud console.

    For more information about Okta settings, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm).

    ![sso-2-2](/byoc/sso-2-2.png)

## Step 3: Configure IdP on Zilliz Cloud{#step-3-configure-idp-on-zilliz-cloud}

Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login) to complete IdP settings.

1. In the **Configure IdP** step, configure IdP settings using the credentials and certificate obtained from Okta in [step 2](./single-sign-on-with-okta#step-2-create-an-integration-in-the-okta-console).

    - **Single Sign-On URL**: Paste the **Sign on URL** value obtained from Okta into this field. This URL receives the SAML authentication requests from Okta.

    - **Entity ID**: Paste the **Issuer** value obtained from Okta into this field. This identifier is used to distinguish the issuer of SAML requests, responses, or assertions,  ensuring that messages from Okta are correctly recognized and accepted by Zilliz Cloud.

    - **Certificate**: Paste the **Signing Certificate** value obtained from Okta into this field. This public key certificate is used to verify the digital signatures of SAML assertions, enabling Zilliz Cloud to authenticate the source of the SAML data securely.

1. Click **Next** to go to the **Enable SSO** step, complete settings as needed, and then click **Save**.

    - **Enable SSO**: decides whether to enable the SSO feature for your organization users. If toggled off, you cannot authenticate users with your IdP.

    - **SSO Login URL**: customizes the URL used to log in to the Zilliz Cloud console. You can specify an alias as needed. In the **Preview** section, you can view the custom URL used for SSO login.

1. In the dialog box that appears, obtain the URL for SSO login.

    <Admonition type="info" icon="📘" title="Notes">

    <p>After setup, you can also obtain the <strong>SSO Status</strong> and <strong>Login URL</strong> by selecting <strong>Settings</strong> &gt; <strong>Single Sign-On (SSO)</strong> on the organization settings page.</p>

    </Admonition>

![sso-3](/byoc/sso-3.png)

## Step 4: Assign app integration to end user{#step-4-assign-app-integration-to-end-user}

Before users can access Zilliz Cloud through the provided SSO login link, you need to make sure that the app is properly set up and assigned to each user.

1. In the [Okta Admin console](https://login.okta.com/), choose **Directory** > **People**.

1. On the **Applications** tab, click **Assign Applications**.

1. In the **Assign Applications** dialog box, find the target application and click **Assign**. Then, click **Done**.

1. In **Username**, enter the email address of your organization user and click **Save and Go Back**. Then, this user can access Zilliz Cloud via the SSO login URL.

![sso-4](/byoc/sso-4.png)

For more information, refer to [Okta official documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm).

## Test configuration{#test-configuration}

To ensure your SSO setup is functional:

1. Access the SSO login URL using a new browser window. You will be redirected to the Okta login page.

1. Log in using the user that has been assigned with the Okta application. You will be redirected to the Zilliz Cloud console if SSO is configured correctly.

