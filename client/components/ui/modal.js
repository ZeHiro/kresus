import { has, maybeHas } from '../../helpers';

export default class Modal extends React.Component {

    constructor(props) {
        has(props, 'modalId');
        has(props, 'modalBody');
        has(props, 'modalTitle');
        has(props, 'modalFooter');
        super(props);
    }

    render() {
        let size = ''
        if (maybeHas(this.props, 'size')) {
            switch (this.props.size) {
                case 'large':
                    size='modal-lg';
                    break;
                case 'small':
                    size='modal-sm';
                    break;
                default:
                    size='';
            }
        }
        return (
            <div className="modal fade" id={ this.props.modalId } tabIndex="-1"
              role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                <div className={ `modal-dialog ${size}` }>
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal"
                              aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <h4 className="modal-title" id="myModalLabel">
                                { this.props.modalTitle }
                            </h4>
                        </div>
                        <div className="modal-body">
                            { this.props.modalBody }
                        </div>
                        <div className="modal-footer">
                            { this.props.modalFooter }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
