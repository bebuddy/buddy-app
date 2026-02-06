import Foundation
import Capacitor
import AuthenticationServices

@objc(GoogleAuth)
public class GoogleAuthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "GoogleAuthPlugin"
    public let jsName = "GoogleAuth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signInWithOAuth", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "signOut", returnType: CAPPluginReturnPromise)
    ]

    private var authSession: ASWebAuthenticationSession?

    @objc func initialize(_ call: CAPPluginCall) {
        print("🔵 [GoogleAuth] initialize")
        call.resolve()
    }

    // ASWebAuthenticationSession으로 Supabase OAuth 직접 호출
    @objc func signInWithOAuth(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"),
              let url = URL(string: urlString),
              let callbackScheme = call.getString("callbackScheme") else {
            call.reject("Missing url or callbackScheme")
            return
        }

        print("🔵 [GoogleAuth] signInWithOAuth - url: \(urlString), scheme: \(callbackScheme)")

        DispatchQueue.main.async {
            self.authSession = ASWebAuthenticationSession(
                url: url,
                callbackURLScheme: callbackScheme
            ) { callbackURL, error in
                self.authSession = nil

                if let error = error {
                    print("🔴 [GoogleAuth] ASWebAuthSession error: \(error.localizedDescription)")
                    call.reject(error.localizedDescription)
                    return
                }

                guard let callbackURL = callbackURL else {
                    print("🔴 [GoogleAuth] No callback URL")
                    call.reject("No callback URL received")
                    return
                }

                print("🟢 [GoogleAuth] Got callback URL: \(callbackURL.absoluteString.prefix(100))...")
                call.resolve(["url": callbackURL.absoluteString])
            }

            self.authSession?.presentationContextProvider = self
            self.authSession?.prefersEphemeralWebBrowserSession = false
            self.authSession?.start()
        }
    }

    @objc func signIn(_ call: CAPPluginCall) {
        call.reject("Use signInWithOAuth instead")
    }

    @objc func signOut(_ call: CAPPluginCall) {
        call.resolve()
    }
}

extension GoogleAuthPlugin: ASWebAuthenticationPresentationContextProviding {
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return self.bridge?.viewController?.view.window ?? ASPresentationAnchor()
    }
}
