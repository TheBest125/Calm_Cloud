class Api::UsersController < ApplicationController

    def create
        @user = User.new(user_params)

        errs = []

        if User.find_by(email: params[:user][:email])
            errs.push("This email address is already in use, please login.")
        end
            
        if (params[:user][:email]).count("@") <= 0 && (params[:user][:email]).split("@").last.count(".") <= 0
            errs.push("Enter a valid email address.")
        end
        
        if User.find_by(username: params[:user][:username])
            errs.push("This username is already taken.")
        end

        if (params[:user][:password]).length < 6
            errs.push("Enter a valid password, at least 6 characters.")
        end

        forbidden_usernames = ["upload", "new-uploads", "favorites", "trending"]

        if forbidden_usernames.include?(params[:user][:username].downcase)
            errs.push("This username is reserved.")
        end

        if errs.length > 0
            render json: errs, status: 401
        elsif @user.save
            login!(@user)
            render :show
        else
            render json: @user.errors.full_messages, status: 401
        end
    end

    def update
        @user = User.find(params[:id])
        if @user && @user.update_attributes(user_params)
            render :show
        elsif !@user
            render json: ['Could not locate user'], status: 400
        else
            render json: @user.errors.full_messages, status: 401
        end
    end

    def show
        @user = User.with_attached_profile_pic.includes(tracks: { audio_track_attachment: :blob, track_artwork_attachment: :blob} ).includes(:favorites).includes(:subscriptions).includes(:subscribers).includes(favorite_tracks: { audio_track_attachment: :blob, track_artwork_attachment: :blob}).includes(user_subscribers: {profile_pic_attachment: :blob} ).includes(subscribe_users: {profile_pic_attachment: :blob} ).find_by(username: params[:username])
        @favorite_tracks = @user.favorite_tracks.with_attached_audio_track.with_attached_track_artwork.includes(user: {profile_pic_attachment: :blob})
    end

    def destroy
        @user = User.find(params[:id])

        if @user
            @user.destroy
            render :show
        else
            render ['Could not find user']
        end
    end

    private

    def user_params
        params.require(:user).permit(:email, :username, :password)
    end


end