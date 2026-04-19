/* eslint-disable react/no-unescaped-entities */
import { Button, Checkbox } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

const TermsAndCondition = () => {
  const [active, setActive] = useState('home')
  const navigate = useNavigate()
  const { t } = useLanguage()
  const onChange = (e) => {
  }

  return (
    <div className='terms'>
      <div className='head'>
        <div className='home-links'>
          <p
            className={active === 'home' ? 'active-link' : ''}
            onClick={() => {
              setActive('home')
              navigate('/homepage')
            }}
          >
            {t('home') || 'Home'}
          </p>
          <span> {'>'} </span>
          <p
            className={active === 'terms' ? 'active-link' : ''}
            onClick={() => {
              setActive('terms')
            }}
          >
            {t('termsAndConditions') || 'Terms & Conditions'}
          </p>
        </div>
        <div className='btn-container'>
          <Button type='primary' onClick={() => navigate(-1)}>{t('back') || 'Back'}</Button>
        </div>
      </div>
      <div className='conditon-div'>
        <h3>ACCEPTANCE OF TERMS</h3>
        <p>
          SamSports.io ("SamSports") provides the SamSports Fantasy Sports
          Commissioner Service (the "Service") as defined below to you subject to the following
          terms of service ("TOS"). SamSports reserves the right to make additions, revisions, and
          modifications to these terms at any time. It is therefore important for you to
          periodically refer to our TOS (this page) for the most current version. By continuing to
          use the Site following such modifications, you agree to comply with this Agreement (the
          "Agreement") and to be bound by any such modifications to the TOS.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>DESCRIPTION OF SERVICE</h3>
        <p>
          SamSports offers a web-based league management system for you to use in order to manage
          fantasy sports leagues on the World Wide Web of the Internet at samsports.io (the
          "Site", "Platform"). In addition to the core features offered by SamSports, this Service
          may include information and features from third-party partners of SamSports. You
          acknowledge and agree that you must: (a) provide for your own access to the World Wide
          Web and pay any service fees associated with such access, and (b) provide all equipment
          necessary for you to make such connection to the World Wide Web, including a computer,
          mobile device, or other access device.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>COPYRIGHT</h3>
        <p>
          All information, content, software, design, text, images, photographs, illustrations,
          audio clips, video clips, artwork, graphic material, or other copyrightable elements
          displayed on, transmitted through, or used in connection with the Site, and the selection
          and arrangements thereof, and trademarks, service marks and trade names (the "Material")
          are the property of SamSports or other respective owners and are protected, without
          limitation, pursuant to U.S. and foreign copyright, trademark and other applicable laws.
          SamSports hereby grants you a personal, non-exclusive, non-assignable and
          non-transferable license to use and display the Material for noncommercial and personal
          use only provided that you maintain all copyright and other notices contained in such
          Material. In accepting these TOS, you agree not to reproduce, modify, create derivative
          works from, display, perform, publish, distribute, disseminate, broadcast or circulate
          any Material to any third party (including, without limitation, the display and
          distribution of the Material via a third party website) without the express prior written
          consent of SamSports. You may not distribute any Material to others, whether or not for
          payment or other consideration, and you may not modify, copy, cache, reproduce, sell,
          publish, transmit, display or otherwise use any portion of the Material. You may not
          screen scrape or otherwise copy our Material without permission. You agree not to
          decompile, reverse engineer or disassemble any software or other products or processes
          accessible through the Site, and not to use any data mining, data gathering or extraction
          method. Any unauthorized or prohibited use may subject the offender to civil liability
          and criminal prosecution under applicable federal and state laws.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>PRIVACY POLICY</h3>
        <p>
          Data submitted for registration and use of the Service are subject to our privacy policy.
          Please see our complete Privacy Policy for details.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>OUTBOUND LINKS</h3>
        <p>
          When you are on the Platform, you could be directed to other web sites that are beyond
          our control as there are links to other sites from our pages that take you outside of our
          service. You acknowledge that when you click on a link that leaves the Platform, the site
          you will land on is not controlled by SamSports and different terms of use and privacy
          policy may apply. By clicking on links to other sites, you acknowledge that SamSports is
          not responsible for those sites. SamSports also reserves the right to disable links from
          third-party sites to any Platform page, although we are under no obligation to do so. In
          addition, the Service allows customers to add outbound links to other sites on the
          Internet. As SamSports has no control over such sites and resources, you acknowledge and
          agree that SamSports is not responsible for the availability of such external sites or
          resources, and does not endorse and is not responsible or liable for any Content,
          advertising, products, or other materials on or available from such sites or resources.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>CUSTOMER CONTENT</h3>
        <p>
          SamSports permits you to upload information, advice, text, data, software, messages and
          other materials to the Site ("Customer Content"). Customer Content is your sole
          responsibility. This means that you, and not SamSports, are entirely responsible for all
          of Customer Content that you upload, post, e-mail, transmit or otherwise make available
          via the Service. SamSports cannot ensure the security of any information you post on
          publicly available areas of the Service. Under no circumstances will we be liable in any
          way for any of Customer Content including, but not limited to, any errors or omissions in
          Customer Content, or for any loss or damage of any kind incurred as a result of the use
          of any of Customer Content made available via the Service. SamSports does not claim
          ownership of Customer Content. However, you hereby grant us a world-wide, royalty-free,
          non-exclusive, perpetual, irrevocable, and fully sub-licensable right and license to use,
          reproduce, modify, adapt, publish, translate, create derivative works from, distribute,
          perform, and display Customer Content and to incorporate Customer Content in other works
          in any form, media, or technology now known or later developed.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>SUBMISSIONS</h3>
        <p>
          Any material (e.g., email, posting to our support boards) you send us, solicited or
          unsolicited, including, but not limited to creative suggestions, ideas, notes, concepts,
          or other information (collectively, the "Submissions"), the Submissions shall be deemed,
          and shall remain, our property. None of the Submissions shall be subject to any obligation
          of confidentiality on our part and we shall not be liable for any use or disclosure of any
          Submissions. Without limitation of the foregoing, we shall exclusively own all now-known
          or hereafter existing rights to the Submissions of every kind and nature throughout the
          universe and shall be entitled to unrestricted use of the Submissions for any purpose
          whatsoever, commercial or otherwise, without compensation to the provider of the
          Submissions or any other person or entity.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>INDEMNIFICATION</h3>
        <p>
          You agree to indemnify and hold SamSports, its affiliates, partners, contractors,
          vendors, officers, directors and employees harmless from any claim, action, demand, loss,
          or damages (including attorneys' fees) made or incurred by any third party arising out of
          or relating to your use of the Service.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>DISCLAIMERS AND LIMITATION OF LIABILITY</h3>
        <p>
          You expressly understand and agree that your use of the Service is at your sole risk. The
          Service is provided on an "as is" and "as available" basis. SamSports expressly disclaims
          all warranties of any kind, whether express or implied, including, but not limited to the
          implied warranties of merchantability, fitness for a particular purpose and
          non-infringement. SamSports, its owners and employees, its content providers, partners,
          and vendors and any of their employees shall not be held responsible for errors or
          omissions pertaining to the accuracy and reliability of any of the information related to
          the Service. SamSports reserves the right to take down the site for periodic maintenance
          and upgrades, and depending on circumstances may not inform customers in advance of any
          such downtime. Any material downloaded or otherwise obtained through the use of the
          Service is done at your own discretion and risk and you will be solely responsible for any
          damage to your computer system or loss of data that results from the download of any such
          material. No advice or information, whether oral or written, obtained by you from SamSports or through or from the Service shall create any warranty not expressly stated in
          the TOS. You expressly understand and agree that SamSports shall not be liable to you for
          any direct, indirect, incidental, special, consequential or exemplary damages, including
          but not limited to, damages for loss of profits, goodwill, use, data or other intangible
          losses (even if SamSports has been advised of the possibility of such damages).
        </p>
      </div>
      <div className='conditon-div'>
        <h3>JURISDICTION AND GOVERNING LAW</h3>
        <p>
          This agreement, and the application or interpretation of this agreement, shall be governed
          exclusively by its terms and in accordance with the laws of the State of Delaware without
          regard to its conflict of law provisions. You and SamSports agree to submit to the
          personal and exclusive jurisdiction of the courts located within the State of Delaware.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>TERMINATION</h3>
        <p>
          SamSports at any time may terminate this Agreement with or without cause. You may
          terminate this agreement by submitting a written request to SamSports. Regardless of
          which party terminates the Agreement, the Service may be immediately suspended or
          disabled, without notice. In the event of either a suspension or termination of the
          Service to you, SamSports shall not be held responsible for any consequences pertaining
          to lack of access to the Service.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>MISCELLANEOUS</h3>
        <p>
          The TOS constitutes the entire agreement between you and SamSports regarding your use of
          the Service from which you accessed this Agreement and governs your use of the Service,
          superseding any prior agreements between you and SamSports with respect to the Service.
          SamSports may modify this Agreement periodically without notice. If any provision of this
          Agreement is determined invalid, all other provisions will remain in effect as fully
          valid.
        </p>
      </div>
      <div className='conditon-div'>
        <div className='check-box'>
          <Checkbox onChange={onChange}>
            {t('agreeTerms') || 'I have read and agree with the Terms and Conditions.'}
          </Checkbox>
        </div>
      </div>
    </div>
  )
}

export default TermsAndCondition
