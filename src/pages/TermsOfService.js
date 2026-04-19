import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LeftOutlined } from '@ant-design/icons'
import '../styles/pages/legalPages.css'

const TermsOfService = () => {
  const navigate = useNavigate()

  return (
    <div className='legal-page'>
      <div className='legal-topbar'>
        <button className='legal-back' onClick={() => navigate(-1)}>
          <LeftOutlined /> Back
        </button>
        <div className='legal-logo'>
          <span>SAMSPORTS</span>
        </div>
        <div className='legal-topbar-spacer' />
      </div>

      <div className='legal-container'>
        <div className='legal-header'>
          <div className='legal-header-badge'>TOS</div>
          <h1>Terms of Service</h1>
          <p className='legal-updated'>Last Updated: March 15, 2026</p>
        </div>

        <div className='legal-body'>
          <section className='legal-section'>
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to SamSports (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or the &quot;Platform&quot;). SamSports is a fantasy sports
              platform operated by Samsports.io By accessing or using the SamSports website, mobile
              application, or any related services (collectively, the &quot;Service&quot;), you agree to be bound by
              these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not access or use
              the Service.
            </p>
            <p>
              We reserve the right to update or modify these Terms at any time. Changes will be posted on
              this page with an updated effective date. Your continued use of the Service after any changes
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className='legal-section'>
            <h2>2. Eligibility</h2>
            <p>
              To use SamSports, you must be at least 18 years of age (or the age of majority in your
              jurisdiction, whichever is greater). By registering for an account, you represent and warrant
              that you meet the age requirement and are legally able to enter into a binding agreement.
            </p>
            <p>
              Participation in paid fantasy sports contests may be restricted or prohibited in certain
              states and jurisdictions. It is your responsibility to ensure that your participation complies
              with all applicable federal, state, and local laws. SamSports does not permit participation
              from jurisdictions where paid fantasy sports are prohibited by law.
            </p>
          </section>

          <section className='legal-section'>
            <h2>3. Account Registration</h2>
            <p>
              To access certain features of the Service, you must create an account by providing accurate,
              current, and complete information. You are responsible for maintaining the confidentiality
              of your account credentials and for all activity that occurs under your account. You agree
              to notify us immediately of any unauthorized use of your account.
            </p>
            <p>
              Each individual may only maintain one SamSports account. Creating multiple accounts to gain
              an unfair competitive advantage, exploit promotions, or circumvent restrictions is strictly
              prohibited and may result in the suspension or termination of all associated accounts.
            </p>
          </section>

          <section className='legal-section'>
            <h2>4. Fantasy Sports Contests</h2>
            <p>
              SamSports offers fantasy sports leagues and contests across multiple sports including but not
              limited to football, basketball, hockey, baseball, and soccer. Users may participate in
              public leagues, private leagues, and other contest formats as made available through the
              Service.
            </p>
            <p>
              By entering a contest, you agree to abide by the rules, scoring systems, and structures
              specific to that contest, including league-specific settings established by league
              commissioners. SamSports reserves the right to cancel, modify, or suspend any contest at any
              time and for any reason, including in the event of technical errors, scoring disputes, or
              circumstances beyond our reasonable control.
            </p>
            <p>
              SamSports utilizes its proprietary &quot;SamPoints&quot; and &quot;SAMmetric&quot; scoring systems. The
              calculation and allocation of points, rankings, rewards, and standings are determined solely
              by SamSports and are final.
            </p>
          </section>

          <section className='legal-section'>
            <h2>5. Entry Fees, Payments &amp; Prizes</h2>
            <p>
              Certain contests require an entry fee. All entry fees are processed through our designated
              payment providers. By submitting payment, you authorize us to charge the applicable amount
              to your selected payment method.
            </p>
            <p>
              Prizes, including SamPoints rewards and monetary payouts, will be distributed in accordance
              with the rules of each specific contest. SamSports reserves the right to withhold prizes if
              we reasonably believe that a participant has violated these Terms or engaged in fraudulent
              activity. You are solely responsible for any tax obligations arising from prizes received
              through the Service.
            </p>
            <p>
              Refund policies vary by contest type. Generally, entry fees are non-refundable once a contest
              has commenced, except as required by law or at the sole discretion of SamSports.
            </p>
          </section>

          <section className='legal-section'>
            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul className='legal-list'>
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
              <li>Engage in collusion, match-fixing, insider trading of player information, or any form of cheating</li>
              <li>Use bots, scripts, automated tools, or artificial intelligence to gain an unfair advantage</li>
              <li>Harass, threaten, or abuse other users through chat, messaging, or any communication feature</li>
              <li>Attempt to gain unauthorized access to other accounts, systems, or data</li>
              <li>Circumvent, disable, or interfere with any security features of the Service</li>
              <li>Post or transmit any content that is defamatory, obscene, or otherwise objectionable</li>
              <li>Exploit the anti-tanking or empire sale systems in a manner inconsistent with fair play</li>
            </ul>
            <p>
              Violation of these rules may result in account suspension, forfeiture of prizes, and
              permanent ban from the Platform.
            </p>
          </section>

          <section className='legal-section'>
            <h2>7. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Service, including but not limited to text,
              graphics, logos, icons, images, audio, video, software, scoring algorithms, the SAMmetric
              system, and the SamSports brand, are owned by Samsports.io or its licensors and are
              protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You are granted a limited, non-exclusive, non-transferable license to access and use the
              Service for personal, non-commercial purposes. You may not reproduce, distribute, modify,
              create derivative works of, publicly display, or otherwise exploit any content from the
              Service without our prior written consent.
            </p>
          </section>

          <section className='legal-section'>
            <h2>8. Third-Party Services &amp; Links</h2>
            <p>
              The Service may contain links to third-party websites, services, or content, including but
              not limited to live sports data feeds, payment processors, and advertising partners.
              SamSports does not endorse or assume any responsibility for third-party content or services.
              Your interaction with third parties is governed by their respective terms and policies.
            </p>
          </section>

          <section className='legal-section'>
            <h2>9. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. SAMSPORTS DOES NOT WARRANT THAT THE
              SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
            </p>
            <p>
              Fantasy sports outcomes depend on real-world athletic performances over which SamSports has
              no control. We make no guarantees regarding the accuracy, timeliness, or completeness of
              player statistics, scores, or other data provided through the Service.
            </p>
          </section>

          <section className='legal-section'>
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SAMSPORTS, ITS OFFICERS, DIRECTORS, EMPLOYEES,
              AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
              CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE,
              INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, EVEN IF ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              IN NO EVENT SHALL OUR TOTAL LIABILITY EXCEED THE AMOUNTS PAID BY YOU TO SAMSPORTS IN THE
              TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section className='legal-section'>
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless SamSports, its affiliates, officers,
              directors, employees, and agents from and against any claims, liabilities, damages, losses,
              and expenses (including reasonable attorneys&apos; fees) arising out of or related to your use of
              the Service, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section className='legal-section'>
            <h2>12. Termination</h2>
            <p>
              We may suspend or terminate your account and access to the Service at any time, with or
              without cause or notice. Upon termination, your right to use the Service immediately ceases.
              Any provisions of these Terms that by their nature should survive termination shall survive,
              including but not limited to ownership provisions, warranty disclaimers, indemnity, and
              limitations of liability.
            </p>
            <p>
              You may close your account at any time by contacting support at hello@samsports.io.
              Outstanding contest obligations or pending transactions must be resolved prior to account
              closure.
            </p>
          </section>

          <section className='legal-section'>
            <h2>13. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of
              Delaware, without regard to its conflict of law principles. Any disputes arising under these
              Terms shall first be submitted to good-faith mediation. If mediation is unsuccessful, the
              dispute shall be resolved through binding arbitration conducted in accordance with the rules
              of the American Arbitration Association.
            </p>
            <p>
              You agree to waive any right to a jury trial or to participate in a class action lawsuit
              against SamSports.
            </p>
          </section>

          <section className='legal-section'>
            <h2>14. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className='legal-contact'>
              <p><strong>Samsports.io</strong></p>
              <p>Email: hello@samsports.io</p>
            </div>
          </section>
        </div>
      </div>

      <div className='legal-footer'>
        <p>&copy; {new Date().getFullYear()} Samsports.io All rights reserved.</p>
      </div>
    </div>
  )
}

export default TermsOfService
