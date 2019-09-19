import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfinity, faEdit, faMusic, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

class TrackEditForm extends React.Component {


    static getDerivedStateFromProps(props, state) {
        if (props.track && !state.stateIsSet) {
            return {
                title: props.track.title,
                description: props.track.description === null ? "" : props.track.description,
                trackArtworkUrl: props.track.trackArtworkUrl === undefined ? window.defaultArtwork : props.track.trackArtworkUrl,
                stateIsSet: true,
            };
        }
        return null;
    }

    constructor(props) {
        super(props);
        this.state = {
            title: "",
            description: "",
            trackArtworkUrl: window.defaultArtwork,
            imageFile: null,
            imageUrl: null,
            stateIsSet: false,
            deleteConfirmation: false,
        };
        this._loading = React.createRef();
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        if (!this.props.track) {
            this.props.fetchTrack(this.props.match.params.trackId);
        } else if (this.props.currentUser !== this.props.track.user_id) {
            this.props.history.push(`/track/${this.props.track.id}`);
        }
    }

    componentDidUpdate() {
        if (!this.props.track) {
            this.props.fetchTrack(this.props.match.params.trackId);
        } else if (this.props.currentUser !== this.props.track.user_id) {
            this.props.history.push(`/track/${this.props.track.id}`);
        }
    }


    handleImageFile(e) {
        const file = e.currentTarget.files[0];
        const fileReader = new FileReader();

        fileReader.onloadend = () => {
            this.setState({
                imageFile: file,
                imageUrl: fileReader.result,
            });
        };

        if (file) {
            fileReader.readAsDataURL(file);
        }

    }

    handleTitle(e) {
        this.setState({
            title: e.currentTarget.value 
        });
    }

    handleDescription(e) {
        this.setState({
            description: e.currentTarget.value,
        });
    }

    handleDelete() {
        if (this.props.track.id === this.props.currentTrack) {
            this.props.removeCurrentTrack();
        }
        this.props.deleteTrack(this.props.track.id);
        this.props.history.push("/");
    }

    handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();

        if (this.props.track.title !== this.state.title) {
            formData.append('track[title]', this.state.title);
        }

        if (this.props.track.description !== this.state.description) {
            formData.append('track[description]', this.state.description);
        }

        if (this.state.imageFile) {
            formData.append('track[track_artwork]', this.state.imageFile);
        }

        this.props.updateTrack({id: this.props.track.id, formData: formData}).then(({ track }) => {
            this.props.history.push(`/track/${track.id}`);
        });
    }

    render() {

        if (!this.props.track) {
            this.props.fetchTrack(this.props.match.params.trackId);
        }

        if (this.props.track) {
            return (
                <section className="track-upload-container">
                    <h1>{`Editing ${this.props.track.title}`}
                        <Link className="track-edit-header-back" to={`/track/${this.props.track.id}`}>Back</Link>
                    </h1>
                    <div className="track-upload-inner-container">

                        <form className="track-upload-form" onSubmit={this.handleSubmit.bind(this)} onKeyPress={(e) => { e.key === 'Enter' && e.preventDefault(); }}>
                            <div className="track-upload-cf">

                                <section className="track-upload-image-container">
                                    <div className="track-upload-image-preview">
                                        <img src={this.state.imageUrl ? this.state.imageUrl : this.state.trackArtworkUrl} />
                                    </div>
                                    <div className="track-upload-change-image-container">
                                        <div className="track-edit-change-image-wrapper">
                                            <input type="file" accept=".jpeg, .jpg, .png, .gif" onChange={(e) => this.handleImageFile(e)} />
                                        </div>
                                    </div>

                                    <section className="track-upload-stage-two-form-fields">
                                        <div className="track-upload-stage-two-form-title-container">
                                            <input type="text"
                                                className="track-title-input"
                                                value={`${this.state.title}`}
                                                onChange={(e) => this.handleTitle(e)}
                                                placeholder="Title"
                                                maxLength="100" />
                                        </div>

                                        <div className="track-upload-stage-two-form-description-container">
                                            <textarea
                                                className="track-description-input"
                                                value={`${this.state.description}`}
                                                onChange={(e) => this.handleDescription(e)}
                                                placeholder="Description"
                                                style={{ height: `${this.state.description.length > 0 ? "79px" : ""}` }}
                                            />
                                        </div>
                                    </section>
                                </section>
                                <section className="track-upload-submission">
                                    <div className="track-edit-delete-container">
                                        { this.state.deleteConfirmation ?
                                            <div className="track-edit-delete-comformation">
                                                <div className="track-upload-button" onClick={() => this.setState({ deleteConfirmation: false })}>
                                                    Cancel
                                                </div>
                                                <div className="track-upload-button">
                                                    Confirm Deletion
                                                </div>
                                            </div>
                                            :
                                            <div className="track-edit-delete-button" onClick={() => this.setState({ deleteConfirmation: true })}>
                                                Delete this upload
                                            </div>
                                        }
                                    </div>
                                    <div className="track-upload-save-container">
                                        <Link to="/" className="track-upload-cancel">Cancel</Link>
                                        <button className="track-upload-button"
                                            disabled={!(this.state.title.length > 0)}
                                            onClick={() => this._loading.style.display = ""}>Save</button>
                                    </div>
                                </section>
                            </div>
                        </form>

                    </div>
                    <div ref={(l) => this._loading = l} className="track-upload-spinner-background" style={{ display: "none" }}><div className="track-upload-spinner"><div></div><div></div><div></div><div></div></div></div>
                </section>
            )
        } else {
            return null;
        }
    }
}

export default TrackEditForm;