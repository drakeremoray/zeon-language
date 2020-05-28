package zeon.language;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RemoteViews;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.util.Calendar;


public class MainActivity extends Activity {

    static final String AppName = "Language";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        SetWebView("");

    }

    @Override
    protected void onNewIntent (Intent intent) {
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|
                    WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD|
                    WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED|
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
                SetWebView(intent.getAction());
    }


    public void SetWebView(String action){

        final WebView mWebView = (WebView) findViewById(R.id.activity_main_webview);
        CookieManager cookieManager = CookieManager.getInstance();

        //mWebView.setWebViewClient(new WebViewClient());
        mWebView.setWebViewClient(new MyWebViewClient());
        mWebView.setWebChromeClient(new WebChromeClient());
        mWebView.setWebContentsDebuggingEnabled(true);

        WebSettings webSettings = mWebView.getSettings();

        //Some of these should improve web view render speed

        webSettings.setRenderPriority(WebSettings.RenderPriority.HIGH);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            // chromium, enable hardware acceleration
            mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        } else {
            // older android version, disable hardware acceleration
            mWebView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }

        //End Render speed settings

        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        mWebView.addJavascriptInterface(this, "AppInterface");

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            cookieManager.setAcceptThirdPartyCookies(mWebView,true);
        } else {
            cookieManager.setAcceptCookie(true);
        }
        final String loadAction = action;

        try {
            mWebView.post(new Runnable() {
                public void run() {
                    if(loadAction == "") {
                        mWebView.loadUrl("http://language.thunderwave.co.nz");
                    }else{
                        mWebView.loadUrl("http://language.thunderwave.co.nz/Html/Index.html#" + loadAction);
                    }
                }
            });
        }catch(Exception ex){
            String billyBob = ex.getMessage();
            Boolean bollyBib = false;

        }
    }

    @JavascriptInterface
    public void SetNextActivation(String language, int hour, int languageIndex){
        Calendar c = Calendar.getInstance();
        c.set(Calendar.MINUTE, 0);
        c.set(Calendar.SECOND, 0);
        if(c.get(Calendar.HOUR) < hour){
            c.set(Calendar.HOUR, hour);
        }else{
            c.set(Calendar.HOUR, hour);
            c.set(Calendar.DATE, c.get(Calendar.DATE) + 1);
        }

        double currentTick = Math.floor(c.get(Calendar.MINUTE) / 30);

        Intent newIntent = new Intent(this, MainActivity.class).setAction(language);
        newIntent.setFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT | Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent alarmPendingIntent = PendingIntent.getBroadcast(MainActivity.this, languageIndex, newIntent, 0);

        AlarmManager alarmMgr = (AlarmManager) getSystemService(Context.ALARM_SERVICE);

        alarmMgr.setExact(AlarmManager.RTC_WAKEUP, c.getTimeInMillis(), alarmPendingIntent);


    }


    @JavascriptInterface
    public String ReadFile(String url){
        try {
            File file = new File(Environment.getExternalStorageDirectory() + "/Cupine/" + AppName + "/" + url);
            if(file.exists()) {
                BufferedReader reader = new BufferedReader(new FileReader(file));
                String readerString = "";
                String line = "";
                while ((line = reader.readLine()) != null) {
                    readerString += line;
                }
                return readerString;
            }else{
                return "";
            }
        }catch(Exception ex) {
            String billyBob = ex.getMessage();
            Boolean bollyBib = false;
            return ex.getMessage();
        }
    }

    @JavascriptInterface
    public String WriteFile(String url, String data){
        try {
            if(url.indexOf("/") > -1) {
                File parentFolder = new File(Environment.getExternalStorageDirectory() + "/Cupine/" + AppName + "/" + url.substring(0, url.lastIndexOf("/")));
                boolean mkdirs = parentFolder.mkdirs();
                if(!mkdirs){
                    mkdirs = parentFolder.mkdir();
                }
                boolean what = !mkdirs;
            }
            File file = new File(Environment.getExternalStorageDirectory() + "/Cupine/" + AppName + "/" + url);
            FileOutputStream writer = new FileOutputStream(file);

            writer.write(data.getBytes());
            return "Success";
        } catch (Exception ex) {
            return ex.getMessage();
        }
    }


    @Override
    public void onBackPressed() {
        return;
    }

}

class MyWebViewClient extends WebViewClient {
    @Override
    public WebResourceResponse shouldInterceptRequest (WebView view, WebResourceRequest request) {
        return super.shouldInterceptRequest(view, request);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return false;
    }
}
