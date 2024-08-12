---
slug: /sso-with-okta
beta: TRUE
notebook: FALSE
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso

---

import Admonition from '@theme/Admonition';


# SSO with Okta

This topic describes how to enable single sign-on (SSO) with the identity provider (IdP) [Okta](https://www.okta.com/). By setting up SSO, you can streamline user access and enhance security by centralizing the authentication mechanism.

The SSO feature offered by Zilliz Cloud works at the organization level and requires the [SAML 2.0](https://en.wikipedia.org/wiki/SAML_2.0) protocol. 

<Admonition type="info" icon="📘" title="Notes">

<p>The SSO feature is currently in Public Preview and available only to users in the whitelist. If you are interested in using this feature, please <a href="https://support.zilliz.com/hc/en-us">submit a ticket</a>.</p>

</Admonition>

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the organization owner of the organization where SSO is to be configured.

- You have admin access to the Okta console.

## Procedure{#procedure}

### Step 1: Initialize setup on Zilliz Cloud{#step-1-initialize-setup-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and enter the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **System Settings** page, choose **Actions** > **Configure** in the **Single Sign-On (SSO)** area.

1. In the **Configure Single Sign-On (SSO)** dialog box, copy the URL in the **Zilliz Cloud Redirect URL** field. This will be required for setting up your IdP.

Keep this browser tab open. Proceed to [step 2](./sso-with-okta#step-2-create-an-integration-in-the-okta-console) for Okta settings.

![sso-1](/img/sso-1.png)

### Step 2: Create an integration in the Okta console{#step-2-create-an-integration-in-the-okta-console}

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **SAML 2.0** and click **Next**.

1. Set a custom app name and click **Next**.

1. In the **Configure SAML** step, configure SAML settings. The required parameters are as follows:

    - **Single sign-on URL**: Enter the URL obtained in [step 1](./sso-with-okta#step-1-initialize-setup-on-zilliz-cloud). This URL is where the SAML assertion is sent via HTTP POST.

    - **Audience URI (SP Entity ID)**: Enter the URL obtained in [step 1](./sso-with-okta#step-1-initialize-setup-on-zilliz-cloud). This is the identifier that the IdP uses to recognize the Service Provider, which in this case is Zilliz Cloud.

1. Click **Next**, select **I’m an Okta customer adding an internal app**, and then click **Finish**. The application will be shown.

![sso-2-1](/img/sso-2-1.png)

1. In the **SAML 2.0** card, click **More details**. Then, copy the following credentials and certificate:

    - **Sign on URL**

    - **Issuer**

    - **Signing Certificate**

![sso-2-2](/img/sso-2-2.png)

For more information about Okta settings, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_saml.htm).

### Step 3: Configure IdP on Zilliz Cloud{#step-3-configure-idp-on-zilliz-cloud}

1. Go back to the Zilliz Cloud console and proceed to the **Configure IdP** step to configure IdP settings using the credentials and certificate obtained from Okta in [step 2](./sso-with-okta#step-2-create-an-integration-in-the-okta-console).

    - **Single Sign-On URL**: Paste the **Sign on URL** value obtained from Okta into this field. This URL receives the SAML authentication requests from Okta.

    - **Entity ID**: Paste the **Issuer** value obtained from Okta into this field. This identifier is used to distinguish the issuer of SAML requests, responses, or assertions,  ensuring that messages from Okta are correctly recognized and accepted by Zilliz Cloud.

    - **Certificate**: Paste the **Signing Certificate** value obtained from Okta into this field. This public key certificate is used to verify the digital signatures of SAML assertions, enabling Zilliz Cloud to authenticate the source of the SAML data securely.

1. Click **Next** to go to the **Enable SSO** step, complete settings as needed, and then click **Save**.

    - **Enable SSO**: decides whether to enable the SSO feature for your organization users. If toggled off, you cannot authenticate users with your IdP.

    - **SSO Login URL**: customizes the URL used to log in to the Zilliz Cloud console. You can specify an alias as needed. In the **Preview** section, you can view the custom URL used for SSO login.

![sso-3](/img/sso-3.png)

## Test configuration{#test-configuration}

Before you test SSO configuration, make sure SSO is enabled in [step 3](./sso-with-okta#step-3-configure-idp-on-zilliz-cloud). To ensure your SSO setup is functional:

1. Access the SSO login URL using a new incognito browser window. You will be redirected to Okta.

1. Log in to Okta. If SSO is configured correctly, you will be redirected to the Zilliz Cloud console.

