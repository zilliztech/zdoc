---
title: "MFA | Cloud"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
notebook: FALSE
description: "Authentication serves as a gateway to verify one's identity during the login process. Zilliz Cloud enhances this security by offering Multi-factor Authentication (MFA), an advanced login method requiring additional verification beyond a password. MFA is an effective measure against unauthorized access and is recommended for all users. Currently, only users registered with a work email and password can manage MFA on the web console. With MFA enabled, you must enter both your password and the email verification code during each login attempt for added security. | Cloud"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - mfa
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems

---

import Admonition from '@theme/Admonition';


# MFA

Authentication serves as a gateway to verify one's identity during the login process. Zilliz Cloud enhances this security by offering Multi-factor Authentication (MFA), an advanced login method requiring additional verification beyond a password. MFA is an effective measure against unauthorized access and is recommended for all users. Currently, only users registered with a work email and password can manage MFA on the web console. With MFA enabled, you must enter both your password and the email verification code during each login attempt for added security.

### Enable MFA{#enable-mfa}

1. Go to your **Profile** and choose **Account Settings**.

1. Activate the Multi-Factor Authentication toggle.

1. In the dialog box, confirm by entering your account password.

1. Enter the verification code sent to your registered email to verify your identity.

1. You will be redirected to the login page. A prompt will appear notifying you that MFA is successfully enabled.

<Admonition type="info" icon="📘" title="Notes">

<p>Users with accounts linked to Google are subject to Google's own MFA settings. For more information, see <a href="https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">Turn on 2-Step Verification</a>. </p>
<p>Similarly, MFA settings for GitHub-linked accounts are managed by GitHub. For more information, see <a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication">Configuring two-factor authentication</a>.</p>

</Admonition>

![enable_mfa_en](/img/enable_mfa_en.png)

### Disable MFA{#disable-mfa}

1. Go to your **Profile** and choose **Account Settings**.

1. Deactivate the Multi-Factor Authentication toggle.

1. In the dialog box, click **Disable** to confirm your action.

1. Verify your identity by entering the verification code sent to your email address. Click **Disable**.

1. A prompt will appear notifying you that MFA is successfully disabled.

<Admonition type="info" icon="📘" title="Notes">

<p>Users with accounts linked to Google are subject to Google's own MFA settings. For more information, see  <a href="https://support.google.com/accounts/answer/1064203?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP">Turn off 2-Step Verification</a>. </p>
<p>Similarly, MFA settings for GitHub-linked accounts are managed by GitHub. For more information, see <a href="https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/disabling-two-factor-authentication-for-your-personal-account">Disabling two-factor authentication for your personal account</a>.</p>

</Admonition>

