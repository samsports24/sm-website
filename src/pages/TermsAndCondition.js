import { Button, Checkbox } from 'antd'
import { useState } from 'react'

const TermsAndCondition = () => {
  const [active, setActive] = useState('home')
  const onChange = (e) => {
    console.log(`checked = ${e.target.checked}`)
  }

  return (
    <div className='terms'>
      <div className='head'>
        <div className='home-links'>
          <p
            className={active === 'home' ? 'active-link' : ''}
            onClick={() => {
              setActive('home')
            }}
          >
            Home
          </p>
          <span> {'>'} </span>
          <p
            className={active === 'terms' ? 'active-link' : ''}
            onClick={() => {
              setActive('terms')
            }}
          >
            Terms & Conditions
          </p>
        </div>
        <div className='btn-container'>
          <Button type='primary'>Back</Button>
        </div>
      </div>
      <div className='conditon-div'>
        <h3>ACCEPTANCE OF TERMS</h3>
        <p>
          Sideline Software, Inc. (“Sideline”) provides the MyFantasyLeague.com Fantasy Football
          Commissioner Service (the “Service”) as defined below to you subject to the following
          terms of service (“TOS”). Sideline reserves the right to make additions, revisions, and
          modifications to these terms at any time. It is therefore important for you to
          periodically refer to our TOS (this page) for the most current version. By continuing to
          use the Site following such modifications, you agree to comply with this Agreement (the
          “Agreement”) and to be bound by any such modifications to the TOS.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>DESCRIPTION OF SERVICE</h3>
        <p>
          Sideline offers a web-based league management system for you to use in order to manage a
          fantasy football league on the World Wide Web of the Internet at
          http://hom.myfantasyleague.com (the “Site”, “MFL”). In addition to the core features
          offered by Sideline, this Service may include information and features from third-party
          partners of Sideline. You acknowledge and agree that you must: (a) provide for your own
          access to the World Wide Web and pay any service fees associated with such access, and (b)
          provide all equipment necessary for you to make such connection to the World Wide Web,
          including a computer and modem or other access device.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>COPYRIGHT</h3>
        <p>
          All information, content, software, design, text, images, photographs, illustrations,
          audio clips, video clips, artwork, graphic material, or other copyrightable elements
          displayed on, transmitted through, or used in connection with site, and the selection and
          arrangements thereof, and trademarks, service marks and trade names (the “Material”) are
          the property of Sideline or other respective owners and are protected, without limitation,
          pursuant to U.S. and foreign copyright, trademark and other applicable laws. Sideline
          hereby grants you a personal, non-exclusive, non-assignable and non-transferable license
          to use and display the Material for noncommercial and personal use only provided that you
          maintain all copyright and other notices contained in such Material. In accepting these
          TOS, you agree not to reproduce, modify, create derivative works from, display, perform,
          publish, distribute, disseminate, broadcast or circulate any Material to any third party
          (including, without limitation, the display and distribution of the Material via a third
          party website) without the express prior written consent of Sideline. You may not
          distribute any Material to others, whether or not for payment or other consideration, and
          you may not modify, copy, cache, reproduce, sell, publish, transmit, display or otherwise
          use any portion of the Material. You may not screen scrape or otherwise copy our Material
          without permission. You agree not to decompile, reverse engineer or disassemble any
          software or other products or processes accessible through Site, and not to use any data
          mining, data gathering or extraction method. Any unauthorized or prohibited use may
          subject the offender to civil liability and criminal prosecution under applicable federal
          and state laws.
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
          When you are on MFL, you could be directed to other web sites that are beyond our control
          as there are links to other sites from MFL pages that take you outside of our service. For
          example, if you click on the FantasySharks.com link on the Submit Lineup page you will be
          taken to a non-MFL site. This may include links to partners, affiliates, and content
          providers that may use our logo(s) as part of a co-branding relationship. You acknowledge
          that when you click on a link that leaves MFL, the site you will land on is not controlled
          by Sideline and different terms of use and privacy policy may apply. By clicking on links
          to other sites, you acknowledge that Sideline is not responsible for those sites. Sideline
          also reserves the right to disable links from third-party sites to any MFL page, although
          we are under no obligation to do so. In addition, the Service allows customers to add
          outbound links to other sites on the Internet. As Sideline has no control over such sites
          and resources, you acknowledge and agree that Sideline is not responsible for the
          availability of such external sites or resources, and does not endorse and is not
          responsible or liable for any Content, advertising, products, or other materials on or
          available from such sites or resources. You further acknowledge and agree that Sideline
          shall not be responsible or liable, directly or indirectly, for any damage or loss caused
          or alleged to be caused by or in connection with use of or reliance on any such Content,
          goods or services available on or through any such site or resource.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>CUSTOMER CONTENT</h3>
        <p>
          Sideline permits you to upload information, advice, text, data, software, messages and
          other materials to the Site (“Customer Content”). Customer Content is your sole
          responsibility. This means that you, and not Sideline, are entirely responsible for all of
          Customer Content that you upload, post, e-mail, transmit or otherwise make available via
          the Service. Sideline cannot ensure the security of any information you post on publicly
          available areas of the Service. Under no circumstances will we be liable in any way for
          any of Customer Content including, but not limited to, any errors or omissions in Customer
          Content, or for any loss or damage of any kind incurred as a result of the use of any of
          Customer Content made available via the Service. Sideline does not claim ownership of
          Customer Content. However, you hereby grant us a world-wide, royalty-free, non-exclusive,
          perpetual, irrevocable, and fully sub-licensable right and license to use, reproduce,
          modify, adapt, publish, translate, create derivative works from, distribute, perform, and
          display Customer Content and to incorporate Customer Content in other works in any form,
          media, or technology now known or later developed. You acknowledge that we do not
          pre-screen Customer Content, but that we have the right, but not the obligation, in our
          sole discretion to modify, transmit over various networks, refuse or move any of Customer
          Content that is available on the Service. You agree that you must evaluate, and bear all
          risks associated with, the use of any of Customer Content including, but not limited to,
          any reliance on the accuracy, completeness, or usefulness of Customer Content. You
          acknowledge and agree that Sideline may archive Customer Content and may also disclose
          Customer Content at any time and for any reason. Since we do not pre-screen user generated
          content, you may be exposed to content that is offensive, indecent, or objectionable.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>SUBMISSIONS</h3>
        <p>
          Any material (e.g., email, posting to our support boards) you send us, solicited or
          unsolicited, including, but not limited to creative suggestions, ideas, notes, concepts,
          or other information (collectively, the “Submissions”), the Submissions shall be deemed,
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
          You agree to indemnify and hold Sideline, its affiliates, partners, contractors, vendors,
          officers, directors and employees harmless from any claim, action, demand, loss, or
          damages (including attorneys’ fees) made or incurred by any third party arising out of or
          relating to your use of the Service.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>DISCLAIMERS AND LIMITATION OF LIABILITY</h3>
        <p>
          You expressly understand and agree that your use of the service is at your sole risk. The
          service is provided on an “as is” and “as available” basis. Sideline expressly disclaims
          all warranties of any kind, whether express or implied, including, but not limited to the
          implied warranties of merchantability, fitness for a particular purpose and
          non-infringement. Sideline, it’s owners and employees, it’s content providers, partners,
          and vendors and any of their employees shall not be held responsible for errors or
          omissions pertaining to the accuracy and reliability of any of the information related to
          the service. Sideline reserves the right to take down the site for periodic maintenance
          and upgrades, and depending on circumstances may not inform customers in advance of any
          such downtime. Sideline also reserves the right to remove any historical league
          information including, but not limited to, polls, articles, and message board posts at
          it’s sole discretion. Any material downloaded or otherwise obtained through the use of the
          service is done at your own discretion and risk and that you will be solely responsible
          for any damage to your computer system or loss of data that results from the download of
          any such material. No advice or information, whether oral or written, obtained by you from
          sideline or through or from the service shall create any warranty not expressly stated in
          the tos. You expressly understand and agree that sideline shall not be liable to you for
          any direct, indirect, incidental, special, consequential or exemplary damages, including
          but not limited to, damages for loss of profits, goodwill, use, data or other intangible
          losses (even if sideline has been advised of the possibility of such damages), resulting
          from: (I) the use or the inability to use the service; (ii) the cost of procurement of
          substitute goods and services resulting from any goods, data, information or services
          purchased or obtained or messages received or transactions entered into through or from
          the service; (iii) unauthorized access to or alteration of your transmissions or data;
          (iv) statements or conduct of any third party on the service; or (v) any other matter
          relating to the service. Some states do not allow the exclusion or limitation of
          incidental or consequential damages, so the above limitation or exclusion may not apply to
          you. In no event shall sideline’s total liability to you for all damages, losses, or
          causes of action exceed the purchase price of the product.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>JURSIDICTION AND GOVERNING LAW</h3>
        <p>
          This agreement, and the application or interpretation of this agreement, shall be governed
          exclusively by its terms and in accordance with the laws of the State of Wisconsin without
          regard to its conflict of law provisions. You and Sideline agree to submit to the personal
          and exclusive jurisdiction of the courts located within the county of Dane, Wisconsin.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>TERMINATION</h3>
        <p>
          Sideline at any time may terminate this Agreement with or without cause. You may terminate
          this agreement by submitting a written request to Sideline. A full refund will be offered
          for any reason through the scheduled kickoff of the fourth week of NFL games. A partial
          refund will never be offered under any circumstances. Regardless of which party terminates
          the Agreement, the Service may be immediately suspended or disabled, without notice. In
          the event of either a suspension or termination of the Service to you, Sideline shall not
          be held responsible for any consequences pertaining to lack of access to the Service.
        </p>
      </div>
      <div className='conditon-div'>
        <h3>MISCELLANEOUS</h3>
        <p>
          The TOS constitutes the entire agreement between you and Sideline regarding your use of
          the Service from which you accessed this Agreement and governs your use of the Service,
          superseding any prior agreements between you and Sideline with respect to the Service.
          Sideline may modify this Agreement periodically without notice. If any provision of this
          Agreement is determined invalid, all other provisions will remain in effect as fully
          valid.
        </p>
      </div>
      <div className='conditon-div'>
        <div className='check-box'>
          <Checkbox onChange={onChange}>
            I have read and agree with the Terms and Conditions.
          </Checkbox>
        </div>
      </div>
    </div>
  )
}

export default TermsAndCondition
