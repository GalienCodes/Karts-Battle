import React, { Fragment, useState, useEffect } from 'react';

let BUTTON_TIMEOUT = 5000;
let timerId = 0;

function BrButton(props) {
  let className = props.className;
  let onClick = props.onClick;
  let label = props.label;
  let timeout = props.timeout || BUTTON_TIMEOUT;
  let id = props.id;
  let hideLabelDuringSubmit = props.hideLabelDuringSubmit;
  let handleMsg = props.handleMsg;
  let disabledLabel = props.disabledLabel;
  const isSubmitting = props.isSubmitting;
  const setIsSubmitting = props.setIsSubmitting;
  let [isSubmittingInternal, setIsSubmittingInternal] = useState();

  useEffect(() => {
    setIsSubmittingInternal(isSubmitting);

    if(timerId) clearTimeout(timerId);

    if(isSubmitting && timeout) {
      timerId = setTimeout(() => {

        setIsSubmittingInternal(false);
        if(setIsSubmitting) {
          setIsSubmitting(false);
        }
        if(handleMsg) {
          handleMsg({ type: 'ui-button-timeout', data: { id: id } });
        }
      }, timeout);
    }
  }, [isSubmitting]);

  return <button type="submit" disabled={disabledLabel || (isSubmitting && isSubmittingInternal)} className={ className || '' } onClick={onClick}>
    { isSubmittingInternal ? 
      <i className="fa fa-refresh fa-spin" style={{ 
        marginRight: isSubmitting && !hideLabelDuringSubmit ? '5px' : '',
        width: isSubmitting ? '' : 0
      }} /> : ''
    }
    { !(hideLabelDuringSubmit && isSubmitting) && 
      <Fragment>
        { label ? (disabledLabel || label) : 'Submit' }
      </Fragment>
    }
  </button>;
}

export default BrButton;