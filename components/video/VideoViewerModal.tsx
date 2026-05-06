import { X } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoViewerModalProps {
    visible: boolean;
    videoUrl: string;
    onClose: () => void;
}

export function VideoViewerModal({ visible, videoUrl, onClose }: VideoViewerModalProps) {
    if (!visible || !videoUrl) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                {/* Header controls */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: 50, // SafeArea
                    paddingHorizontal: 20,
                    paddingBottom: 16,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    zIndex: 10,
                }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontFamily: 'SpaceGrotesk_700Bold' }}>
                        Video phiên khám
                    </Text>
                    <Pressable
                        onPress={onClose}
                        style={{
                            width: 36, height: 36,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 18,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={20} color="#fff" />
                    </Pressable>
                </View>

                {/* Video Container */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <WebView
                        source={{ uri: videoUrl }}
                        style={{ flex: 1, backgroundColor: '#000' }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={false}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                justifyContent: 'center', alignItems: 'center',
                                backgroundColor: '#000'
                            }}>
                                <ActivityIndicator size="large" color="#fff" />
                                <Text style={{ color: '#fff', marginTop: 10, fontFamily: 'SpaceGrotesk_500Medium' }}>
                                    Đang tải video...
                                </Text>
                            </View>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}
