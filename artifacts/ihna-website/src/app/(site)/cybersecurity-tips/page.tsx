// This file is the page: edit it freely.
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { pageMetadata, Checklist, ChecklistItems, Hero, SplitProse, Timeline, img } from '@/components/page'

export const metadata: Metadata = pageMetadata({
  title: 'Cybersecurity Tips',
  path: '/cybersecurity-tips/',
  description: 'In an era where cybersecurity threats are on the rise, it’s important to take proactive steps to safeguard your digital presence and that of our…',
})

const tick = (items: ReactNode[]) => <ChecklistItems columns={1} items={items} />

export default function CybersecurityTipsRoute() {
  return (
    <>
      <Hero heading="Cybersecurity Tips" variant="split" look="orbit" audienceSwitch={false} image={img({ src: '/images/ihna/pages/cybersecurity-tips.webp', alt: 'Working on a laptop', width: 546, height: 682 })} />
      <SplitProse eyebrow="Cybersecurity" heading="Stay Informed, Stay *Safe!*">
        <p>In an era where cybersecurity threats are on the rise, it’s important to take proactive steps to safeguard your digital presence and that of our organisation. Cybercriminals are becoming more sophisticated, making it imperative for each of us to adopt protective measures.</p>
        <p>To help you navigate the digital landscape securely, we offer the following essential cybersecurity tips. By staying informed and implementing these practices, you can significantly reduce the risk of falling victim to cyber threats and ensure a safer online experience.</p>
        <p>Together, let’s stay safe and keep our organisation resilient in the face of cyber threats!</p>
      </SplitProse>
      <Timeline
        tone="muted"
        heading="Simple Cybersecurity Tips"
        steps={[
          { title: 'Keep Everything Updated:', body: tick(['Regularly update your apps and devices to fix issues, address security concerns, and add new features.', 'Updates make it harder for hackers to access your devices or accounts.']) },
          { title: 'Use Multi-Factor Authentication (MFA):', body: tick(['Turn on MFA for an extra layer of security for both personal and organisational accounts.', 'MFA requires more than one check, like a code from a text message and your passphrase, making it tough for cybercriminals to access your accounts.']) },
          { title: 'Backup Your Information:', body: tick(['Set up regular backups to keep a digital copy of your important data.', 'Backups can be stored on external devices or online servers (like the cloud), helping you restore your files if needed.']) },
          { title: 'Secure Passphrases:', body: tick(['When MFA isn’t an option, use strong passphrases with four or more random words.', 'Passphrases are hard for cybercriminals to guess but easy for you to remember.']) },
          { title: 'Recognise and Report Scams:', body: tick(['Be cautious with emails, SMS, calls, and social media messages.', 'Criminals may pretend to be someone you know; avoid clicking on attachments or links.']) },
        ]}
      />
      <Checklist
        heading="Level Up Your Cybersecurity by:"
        items={[
          'Think Before You Post Online: Be mindful of the information you share.',
          'Sign Up for Alerts: Stay informed about new threats with our free alert service.',
          'Talk About Cybersecurity: Share tips with your family and friends.',
          'Avoid Public Wi-Fi for Banking: Use secure networks for online banking or shopping.',
          'Report Incidents: Help keep Australia secure by reporting cyber-attacks and incidents.',
        ]}
      />
      <SplitProse heading="Report Cybersecurity Incidents:" tone="muted">
        <ul>
          <li>Visit <a href="https://www.cyber.gov.au/" rel="noopener noreferrer">cyber.gov.au</a></li>
          <li>Call <a href="tel:1300292371">1300 CYBER1 (1300 292 371) </a></li>
        </ul>
        <h4>Explore additional resources at <a href="https://cyber.gov.au/learn" rel="noopener noreferrer">cyber.gov.au/learn</a>. Stay safe online!</h4>
      </SplitProse>
      <SplitProse eyebrow="Microsoft 365" heading="Setting up Multi-Factor Authentication for Microsoft 365 Accounts">
        <h3>Secure Your Account with Multi-Factor Authentication (MFA)</h3>
        <p>At HCI, safeguarding the security of our staff and the sensitive data we handle is our top priority. As part of our ongoing commitment to fortify our systems, we are excited to announce the implementation of Multi-Factor Authentication (MFA) for all Microsoft 365 accounts.</p>
        <h3>What is MFA?</h3>
        <p>Multi-Factor Authentication adds an extra layer of protection to your account by requiring a second form of verification alongside your password. This additional step enhances the security of your account and reduces the risk of unauthorised access.</p>
      </SplitProse>
      <Timeline
        tone="muted"
        heading="How to Set Up MFA: Step-by-Step Guide"
        steps={[
          { title: 'Step 1: Sign in to Microsoft 365', body: <p>Using your work or school account, log in to Microsoft 365 with your password as usual.</p> },
          { title: 'Step 2: Choose Next', body: <p>After entering your password, click on “Next” when prompted for more information.</p> },
          {
            title: 'Step 3: Set Up Microsoft Authenticator App',
            body: (
              <>
                <p>We recommend using the free Microsoft Authenticator app as the authentication method. If you already have the app installed, select “Next” and follow the prompts to add your account. If not, download the app from the links provided:</p>
                <ul>
                  <li>Google Android: <a href="https://play.google.com/store/apps/details?id=com.azure.authenticator&amp;pcampaignid=web_share" rel="noopener noreferrer">Download from Google Play Store</a></li>
                  <li>Apple IOS: <a href="https://play.google.com/store/apps/details?id=com.azure.authenticator&amp;pcampaignid=web_share" rel="noopener noreferrer">Download from Google Play Store</a></li>
                </ul>
              </>
            ),
          },
          { title: 'Step 4: Specify Your Additional Verification Method', body: <p>Follow the instructions to specify your additional verification method, which may involve linking the app to your account. After completing this step, the next time you sign in to Microsoft 365, you’ll be prompted to provide additional verification information or take action, such as entering the verification code from your authenticator app or received via text message.</p> },
          { title: 'Note:', body: <p>You’ll likely only need the additional verification method the first time you sign in to a new app or device or after changing your password. In most cases, daily use won’t require the additional verification unless specified by our organisation.</p> },
        ]}
      />
      <SplitProse eyebrow="Scam alert" heading="Phishing Emails and Messages">
        <p>Phishing emails are deceptive messages designed to extract sensitive information from you by posing as legitimate sources, including your bank, colleagues, or clients. Recognising the severity of this issue, we aim to raise awareness and prevent any potential scams.</p>
        <p>An illustrative example of these phishing attempts is provided below:</p>
        <h4>Emails received in Outlook on a computer</h4>
        <h4>Emails received in Outlook on a mobile phone</h4>
        <p>In these incidents, scammers request the sharing of a WhatsApp number and subsequently coerce individuals into purchasing gift cards (such as Apple or STEAM cards) and sharing the voucher codes. These actions are executed with a sense of urgency and confidentiality.</p>
        <p>It is crucial to note that HCI staff or management will never request any payment from staff for workplace-related matters. Exercise extra caution when handling such emails, refrain from disclosing bank details or personal contacts, and safeguard your finances by avoiding these traps.</p>
      </SplitProse>
      <Checklist
        tone="muted"
        columns={1}
        intro="To fortify yourself and our organisation against phishing attacks, please adhere to the following guidelines:"
        items={[
          'Avoid opening attachments or clicking on links in suspicious emails. These may contain viruses or spyware that can compromise your computer or steal your data.',
          'Do not reply to or forward suspicious emails. Report such emails to the IT department or student support team and promptly delete them.',
          'Carefully check the sender’s email address. Phishing emails often use spoofed or similar-looking addresses. Double-check the email ID, not just the Display Name. For instance, even if the sender’s name is listed as Dr. Bijo Kunnumpurath, the actual email ID may be different (e.g., mailbox.hr.com@gmail.com).',
          'Be vigilant for spelling and grammar errors, unusual or urgent requests, or offers that seem too good to be true. These are common indicators of phishing emails.',
          'If uncertain about an email’s legitimacy, verify with the sender through an alternate channel. Avoid using contact information provided in the email, as it may be fraudulent.',
        ]}
      />
      <SplitProse eyebrow="Advisory" heading="Advisory Regarding Atlassian Products">
        <p>This advisory is crucial for Australian users of Atlassian products, including Confluence, Jira, and Bitbucket. Atlassian has recently released security patches addressing vulnerabilities in certain product versions. Here’s a summary of the key information:</p>
        <h3>Background / What has happened?</h3>
        <ul>
          <li>Atlassian has released patches for security vulnerabilities, including critical ones (CVE-2023-22522, CVE-2023-22523, and CVE-2022-1471), impacting various versions of Confluence, Jira, and Bitbucket.</li>
          <li>The Australian Signal Directorate’s Australian Cyber Security Centre (ASD’s ACSC) emphasises the possibility of exploitation, given the historical significance of critical vulnerabilities in Confluence and Jira.</li>
          <li>Malicious cyber actors may employ patch differential analysis to reverse engineer vulnerabilities, making an exploitation campaign likely.</li>
          <li>Atlassian Cloud operated sites are not affected.</li>
          <li>An additional critical vulnerability has been addressed in the MacOS Atlassian Companion Application (CVE-2023-22524), requiring user interaction but still deemed critical.</li>
        </ul>
        <h3>Mitigation / How do I stay secure?</h3>
        <ul>
          <li>If you operate Confluence, Jira, or Bitbucket, especially in internet-facing configurations, review the vendor advisories to determine if you are affected.</li>
          <li>Apply all vendor-recommended mitigations carefully if you are affected.</li>
          <li>Reassess the necessity of making your system internet-facing and consider filtering from the internet if possible.</li>
        </ul>
        <p>Additional Information: For more details, refer to the following vendor advisories:</p>
        <ul>
          <li><a href="https://confluence.atlassian.com/security/cve-2023-22522-rce-vulnerability-in-confluence-data-center-and-confluence-server-1319570362.html" rel="noopener noreferrer">https://confluence.atlassian.com/security/cve-2023-22522-rce-vulnerability-in-confluence-data-center-and-confluence-server-1319570362.html</a></li>
          <li><a href="https://confluence.atlassian.com/security/cve-2022-1471-snakeyaml-library-rce-vulnerability-in-multiple-products-1296171009.html" rel="noopener noreferrer">https://confluence.atlassian.com/security/cve-2022-1471-snakeyaml-library-rce-vulnerability-in-multiple-products-1296171009.html</a></li>
          <li><a href="https://confluence.atlassian.com/security/cve-2023-22523-rce-vulnerability-in-assets-discovery-1319248914.html" rel="noopener noreferrer">https://confluence.atlassian.com/security/cve-2023-22523-rce-vulnerability-in-assets-discovery-1319248914.html</a></li>
          <li><a href="https://confluence.atlassian.com/security/cve-2023-22524-rce-vulnerability-in-atlassian-companion-app-for-macos-1319249492.html" rel="noopener noreferrer">https://confluence.atlassian.com/security/cve-2023-22524-rce-vulnerability-in-atlassian-companion-app-for-macos-1319249492.html</a></li>
        </ul>
      </SplitProse>
    </>
  )
}
