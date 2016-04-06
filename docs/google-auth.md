# Enable Google Authentication
[This document is part of [Document Processing Pipeline](../README.md)]

1. Browse to [Google Developer Console](https://console.developers.google.com/?pli=1). 
2. Under `Use Google APIs`, click `Enable and Manage APIs` link.
3. Select `Google+ API` and click `Enable`.
4. Open the `Credentials` tab. Click the `Create Credentials` select box and select `OAuth client ID`.
5. Select `Web Application` option from the menu and fill in the following details:
  * In the `Authorized JavaScript origins`, add the Url for your website: `http://localhost:3000` in this case.
  * In the `Authorized redirect URIs`, add the callback Url: `http://localhost:3000/.auth/login/google/callback` in this case.
  * Click the `Create` button.
6. You'll get a `client Id` and a `client secret`. Copy these strings to a temporary file. We'll use it in a bit.
