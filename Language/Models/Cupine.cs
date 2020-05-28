using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;


namespace Language.Models {
    public static class DateHelper {
        public static String NiceDateString(DateTime? d) {
            if (d == null) {
                return "";
            } else {
                return d.Value.ToString("d MMM, yyyy");
            }
        }
    }

    public static class UserRoles {
        public const String User = "User";

        public static List<String> UserRolesList = new List<String>(){
            User
        };
    }


    public class CustomAuthorise : AuthorizeAttribute {
        public String[] RolesAllowed { get; set; }
        public Boolean LoggedIn { get; set; }

        public CustomAuthorise(params String[] rolesAllowed)
            : base() {
            RolesAllowed = rolesAllowed;
        }
        protected override Boolean AuthorizeCore(HttpContextBase httpContext) {
            //Thread.Sleep(2000);
            if (httpContext.Session["UserId"] == null) {
                if (httpContext.Request.Cookies["User"] != null) {
                    using (var session = MvcApplication.Store.OpenSession()) {
                        var decodedToken = JsonConvert.DeserializeObject<Dictionary<String, Object>>(EncryptionHelper.Decrypt(httpContext.Request.Cookies["User"].Value, "christmascarol"));

                        var user = session.Load<User>(Int32.Parse(decodedToken["UserId"].ToString()));

                        if (user == null) {
                            httpContext.Response.Cookies["User"].Expires = DateTime.UtcNow.AddDays(-5);
                            LoggedIn = false;
                            return false;
                        }
                        httpContext.Session["UserId"] = user.Id;
                        httpContext.Session["UserName"] = user.Name;
                    }
                } else {
                    LoggedIn = false;
                    return false;
                }
            }

            LoggedIn = true;
            return true;

        }
        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext) {
            var jsonSerializer = new JavaScriptSerializer();
            filterContext.HttpContext.Response.StatusCode = 500;
            filterContext.HttpContext.Response.ContentType = "application/json";
            filterContext.HttpContext.Response.ContentEncoding = Encoding.UTF8;

            if (!LoggedIn) {
                filterContext.HttpContext.Response.Write(jsonSerializer.Serialize(new { Message = "Log In" }));
                filterContext.HttpContext.Response.Flush();
                filterContext.HttpContext.Response.End();
                base.HandleUnauthorizedRequest(filterContext);
            } else {
                filterContext.HttpContext.Response.Write(jsonSerializer.Serialize(new { Message = "Permission Denied" }));
                filterContext.HttpContext.Response.Flush();
                filterContext.HttpContext.Response.End();
                base.HandleUnauthorizedRequest(filterContext);
            }
        }
    }


    public class JsonNetResult : JsonResult {
        public JsonNetResult(Object data) {
            Data = data;
        }

        public override void ExecuteResult(ControllerContext context) {
            HttpResponseBase response = context.HttpContext.Response;
            response.ContentType = "application/json";
            if (ContentEncoding != null)
                response.ContentEncoding = ContentEncoding;
            if (Data != null) {
                JsonTextWriter writer = new JsonTextWriter(response.Output) { Formatting = Formatting.Indented };
                JsonSerializer serializer = JsonSerializer.Create(new JsonSerializerSettings());
                serializer.Serialize(writer, Data);
                writer.Flush();
            }
        }
    }

    public static class EmailHelper {

        public static void Email(String to, String subject, String message, String fileName = "") {
            Thread email = new Thread(delegate () {
                SendEmail(to, subject, message, fileName);
            });
            email.IsBackground = true;
            email.Start();
        }

        private static void SendEmail(String to, String subject, String body, String fileName) {
            try {
                SmtpClient smtpClient = new SmtpClient();
                MailMessage mailMessage = new MailMessage();
                mailMessage.Headers.Add("X-SMTPAPI", "{\"filters\": {\"templates\": {\"settings\": {\"enable\": 1,\"template_id\": \"" + ConfigurationManager.AppSettings["SendGridTemplateId"] + "\"}}}}");
                mailMessage.To.Add(new System.Net.Mail.MailAddress(to));
                mailMessage.Subject = subject;
                mailMessage.IsBodyHtml = true;
                mailMessage.Body = body;
                if (fileName != "") {
                    var attachment = new Attachment(fileName);
                    attachment.Name = fileName.Substring(fileName.LastIndexOf("/") + 1);
                    mailMessage.Attachments.Add(attachment);
                }
                smtpClient.Send(mailMessage);
                //smtpClient.SendMailAsync(mailMessage);
            } catch (Exception ex) {
                var mike = ex.InnerException;
            }
        }

    }

    public class ErrorHandlerAttribute : FilterAttribute, IExceptionFilter {
        public void OnException(ExceptionContext filterContext) {
            filterContext.ExceptionHandled = true;
            try { filterContext.HttpContext.Response.StatusCode = 500; } catch { }
            filterContext.Result = new JsonResult {
                Data = new { Message = filterContext.Exception.Message },
                JsonRequestBehavior = JsonRequestBehavior.AllowGet
            };
        }
    }

    public static class EncoderHelper {
        public static String Encode(Object o) {
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(JsonConvert.SerializeObject(o)));
        }
        public static Object Decode(String s) {
            return JsonConvert.DeserializeObject(System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(s)));
            //return JsonConvert.DeserializeObject<Dictionary<String, String>>(System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(s)));
        }
    }

    public static class PasswordHash {
        // The following constants may be changed without breaking existing hashes.
        public const Int32 SALT_BYTE_SIZE = 24;
        public const Int32 HASH_BYTE_SIZE = 24;
        public const Int32 PBKDF2_ITERATIONS = 1000;

        public const Int32 ITERATION_INDEX = 0;
        public const Int32 SALT_INDEX = 1;
        public const Int32 PBKDF2_INDEX = 2;

        public static String CreateHash(String password) {
            RNGCryptoServiceProvider csprng = new RNGCryptoServiceProvider();
            Byte[] salt = new Byte[SALT_BYTE_SIZE];
            csprng.GetBytes(salt);

            Byte[] hash = PBKDF2(password ?? "", salt, PBKDF2_ITERATIONS, HASH_BYTE_SIZE);
            return PBKDF2_ITERATIONS + ":" + Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        public static Boolean ValidatePassword(String password, String correctHash) {
            Char[] delimiter = { ':' };
            String[] split = correctHash.Split(delimiter);
            Int32 iterations = Int32.Parse(split[ITERATION_INDEX]);
            Byte[] salt = Convert.FromBase64String(split[SALT_INDEX]);
            Byte[] hash = Convert.FromBase64String(split[PBKDF2_INDEX]);

            Byte[] testHash = PBKDF2(password ?? "", salt, iterations, hash.Length);
            return SlowEquals(hash, testHash);
        }

        private static Boolean SlowEquals(Byte[] a, Byte[] b) {
            UInt32 diff = (UInt32)a.Length ^ (UInt32)b.Length;
            for (Int32 i = 0; i < a.Length && i < b.Length; i++)
                diff |= (UInt32)(a[i] ^ b[i]);
            return diff == 0;
        }


        private static Byte[] PBKDF2(String password, Byte[] salt, Int32 iterations, Int32 outputBytes) {
            Rfc2898DeriveBytes pbkdf2 = new Rfc2898DeriveBytes(password, salt);
            pbkdf2.IterationCount = iterations;
            return pbkdf2.GetBytes(outputBytes);
        }
    }

    public class EncryptionHelper {
        private static readonly byte[] initVectorBytes = Encoding.ASCII.GetBytes("eACp7a4806iYBjDN");

        // This constant is used to determine the keysize of the encryption algorithm.
        private const int keysize = 256;

        public static string Encrypt(string plainText, string passPhrase) {
            byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
            using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null)) {
                byte[] keyBytes = password.GetBytes(keysize / 8);
                using (RijndaelManaged symmetricKey = new RijndaelManaged()) {
                    symmetricKey.Mode = CipherMode.CBC;
                    using (ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes)) {
                        using (MemoryStream memoryStream = new MemoryStream()) {
                            using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write)) {
                                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                cryptoStream.FlushFinalBlock();
                                byte[] cipherTextBytes = memoryStream.ToArray();
                                return Convert.ToBase64String(cipherTextBytes);
                            }
                        }
                    }
                }
            }
        }

        public static string Decrypt(string cipherText, string passPhrase) {
            cipherText = cipherText.Replace("%20", "+").Replace(" ", "+");
            byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
            using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null)) {
                byte[] keyBytes = password.GetBytes(keysize / 8);
                using (RijndaelManaged symmetricKey = new RijndaelManaged()) {
                    symmetricKey.Mode = CipherMode.CBC;
                    using (ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes)) {
                        using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes)) {
                            using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read)) {
                                byte[] plainTextBytes = new byte[cipherTextBytes.Length];
                                int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                            }
                        }
                    }
                }
            }
        }
    }
}