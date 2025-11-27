# Why another playlist conversion tool?

I found that existing tools like Spotlistr and Tune My Music often don’t handle Japanese songs well.

Test Dataset:
```
嘘つき - あたらよ
トワイライト - shallm
アルジャーノン - ヨルシカ
晩餐歌 - Bansanka - tuki.
ヒッチコック - ヨルシカ
夜行 - ヨルシカ
嘘月 - ヨルシカ
```

This tool serves as a companion to [GoMusic](https://github.com/Bistutu/GoMusic)
, which parses Netease playlists into clean “song – artist” pairs, making it easier to achieve accurate conversions.

![Demo 1](assets/images/demo-input.png)
![Demo 2](assets/images/demo-results.png)


## How to use

### 0. [Optional] Get your playlist text from GoMusic

Please refer to [https://github.com/Bistutu/GoMusic](https://github.com/Bistutu/GoMusic)

### 1. Obtain Spotify Client ID && Set Redirect URI

To connect PlaylistBridge to Spotify, you need a Client ID. Follow these steps:

1.  Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2.  Log in with your Spotify account.
3.  Click on **"Create App"**.
4.  Fill in the App Name (e.g., "PlaylistBridge")
5.  In the **Redirect URIs** section, add the following URL:
    ```
    https://playlist-bridge-demo.vercel.app/spotify/callback
    ```
    *(Note: You can also choose to self-host, if so, put your own endpoint here)*
6.  Save the app.
7.  On your app's dashboard page, look for the **Client ID**.

### 2. Use Custom Credentials in PlaylistBridge

Once you have your Client ID, you can use it in the PlaylistBridge app:

1.  Open the PlaylistBridge login page.
2.  Check the box **"Use custom credentials"**.
3.  Enter your **Client ID** in the "Client ID" field.
4.  Enter the **Redirect URI** you configured in the Spotify Dashboard (e.g., `https://playlist-bridge-demo.vercel.app/spotify/callback`).
5.  Click **"Connect to Spotify"**.

![Custom Credentials UI](assets/images/custom_credentials.png)

Your credentials will be saved locally in your browser, so you don't need to enter them every time.

## TODO:

- [ ] measure similarity between input songs and matched songs